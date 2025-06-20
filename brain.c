#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdbool.h>
#include "myStack.h"

#define SIZE_CAP 16384
#define CSIZE 1024

bool DEBUG = false;

char badOpenTag[CSIZE];
char badCloseTag[CSIZE];
int errorLineNumber = 0;
char errorContext[CSIZE];

int validate(char*);
int add(char*, char*, char*, char*);
void help();

void help(){
    if(DEBUG){
        printf("Help called!\n");
    }
    printf("These are the commands you can run!\n");
    printf("help\nvalidate\n");
}

int repair(char* myPath, char* option){
    if(DEBUG){
        printf("Repair called on : %s with options = %s\n", myPath, option);
    }
    if(validate(myPath) == 1){
        if(DEBUG){
            printf("File has already been validated!\n");
        }
        return 0;
    }   
    
    int fd = open(myPath, O_RDONLY, 0644);

    if(fd == -1){
        if(DEBUG){
            printf("There was an error opening your file. \n");
            printf("Most likely, your file does not exist.\n");
        }
        
        return 0;
    }

    char doc[SIZE_CAP];
    char newDoc[SIZE_CAP];

    read(fd, doc, SIZE_CAP);
    close(fd);


    char openTag[CSIZE + 3];
    char closeTag[CSIZE + 4];

    if(strstr(option, "-o") != NULL){
        sprintf(closeTag, "</%s>", badOpenTag);
        char tempBadTag[strlen(badCloseTag) + 2];
        sprintf(tempBadTag, "</%s>", badCloseTag);

        char* closePtr = strstr(doc, tempBadTag);
        if (closePtr == NULL) {
            if (DEBUG) {
                printf("Could not find closing tag to replace: %s\n", tempBadTag);
            }
            return 0;
        }

        *closePtr = '\0';

        strcpy(newDoc, doc);
        strcat(newDoc, closeTag);

        closePtr += strlen(tempBadTag);

        strcat(newDoc, closePtr);

        fd = open(myPath, O_WRONLY | O_TRUNC);
        if(fd == -1){
            printf("Failed to reopen file for writing");
            return 0;
        }

        write(fd, newDoc, strlen(newDoc));
        close(fd);
    }
    else if(strstr(option, "-c") != NULL){
        sprintf(openTag, "<%s>", badCloseTag);
        char tempBadTag[strlen(badOpenTag) + 2];
        sprintf(tempBadTag, "<%s>", badOpenTag);

        char* openPtr = strstr(doc, tempBadTag);
        if (openPtr == NULL) {
            if (DEBUG) {
                printf("Could not find opening tag to replace: %s\n", tempBadTag);
            }
            return 0;
        }

        *openPtr = '\0';

        strcpy(newDoc, doc);
        strcat(newDoc, openTag);

        openPtr += strlen(tempBadTag);

        strcat(newDoc, openPtr);

        fd = open(myPath, O_WRONLY | O_TRUNC);
        if(fd == -1){
            perror("Failed to reopen file for writing");
            return 0;
        }

        write(fd, newDoc, strlen(newDoc));
        close(fd);
    }
    else{
        if(DEBUG){
            printf("Option flag not properly set, exiting.\n");
            return 0;
        }
    }

    return 1;
}


int validate(char* myPath){
    if(DEBUG){
        printf("Validate called on : %s\n", myPath);
    }
    int fd = open(myPath, O_RDONLY, 0644);

    if(fd == -1){
        if(DEBUG){
            printf("There was an error opening your file. \n");
            printf("Most likely, your file does not exist.\n");
        }
        
        return 0;
    }

    char doc[SIZE_CAP];

    read(fd, doc, SIZE_CAP);
    close(fd);

    Stack s;
    init(&s);
    bool valid = true;
    int lineNumber = 0;

    char* token = strtok(doc, "\n");
    lineNumber++;

    while ((token = strtok(NULL, "\n")) != NULL) {
        lineNumber++;
        char* line = strdup(token);
        char* current = line;
        char *tag;

        while ((tag = strchr(current, '<')) != NULL) {
            tag++;
            if (*tag == '/') {
                tag++;
                char* tagName = strdup(tag);
                char* endTag = strchr(tagName, '>');
                char* spaceEndTag = strchr(tagName, ' ');

                if (spaceEndTag && (!endTag || spaceEndTag < endTag)) {
                    endTag = spaceEndTag;
                }
                if (endTag) {
                    *endTag = '\0';
                }

                char* actualTop = pop(&s);
                if(DEBUG){
                    printf("Popped: %s\n", actualTop);
                }

                if(strcmp(actualTop, tagName) == 0){
                    if(DEBUG){
                        printf("MATCH : %s\n", tagName);
                    }
                    
                }
                else{
                    if(DEBUG){
                        printf("GOTCHA!: %s \n", tagName);
                    }
                    strcpy(badOpenTag, actualTop);
                    strcpy(badCloseTag, tagName);
                    errorLineNumber = lineNumber;
                    strncpy(errorContext, token, CSIZE-1);
                    errorContext[CSIZE - 1] = '\0';

                    free(tagName);
                    free(line);
                    return 0;
                }

                free(tagName);

            } else {
                char* tagName = strdup(tag);
                char* endTag = strchr(tagName, '>');
                char* spaceEndTag = strchr(tagName, ' ');

                if (spaceEndTag && (!endTag || spaceEndTag < endTag)) {
                    endTag = spaceEndTag;
                }
                if (endTag) {
                    *endTag = '\0';
                }

                push(&s, tagName);
                if(DEBUG){
                    printf("Pushed: %s\n", tagName);
                }

                free(tagName);
            }

            current = strchr(current, '<');
            if (!current) break;
            current++;
        }

        free(line);
    }

    if(!isEmpty(&s)){
        char* unclosedTag = pop(&s);
        strcpy(badOpenTag, unclosedTag);
        strcpy(badCloseTag, "EOF");
        errorLineNumber = lineNumber;
        strcpy(errorContext, "End of file reached with unclosed tags");
        return 0;
    }

    return 1;
}

int main(int argc, char *argv[]){
    if(DEBUG){
        printf("Welcome to the brains of the operation!\n");
    }
    
    if(argc < 2){
        if(DEBUG){
            printf("You didn't tell me what to do :c");
        }
        return 2;
    }

    //Command Parsing
    char* command = argv[1];
    if(strcmp(argv[argc - 1], "-d") == 0){
        DEBUG = true;
    }
    if(strcmp(command, "help") == 0){
        if(argc != 2){
            printf("For help, please use: './brain.exe help'.\n");
            return 2;
        }
        help();
    }
    else if(strcmp(command, "validate") == 0){
        if(argc < 4){
            printf("To validate, please use: './brain.exe validate -p <path>'\n");
            return 2;
        }
        int status = validate(argv[3]);
        printf("Validation complete.\n");
        if(status == 0){
            printf("    INVALID XML DOCUMENT\n");
            printf("    ERROR AT LINE : %d\n", errorLineNumber);
            printf("    EXPECTED CLOSING TAG : %s\n", badOpenTag);
            printf("    FOUND CLOSING TAG : %s\n", badCloseTag);
            printf("    CONTEXT: %s\n", errorContext);
        }
        if(status == 1){
            printf("    @VALID XML DOCUMENT\n");
        }
    }
    else if(strcmp(command, "repair") == 0){
        if(argc < 5){
            printf("To validate, please use: './brain.exe repair -p <path> <-o/-c>'\n");
            printf("    -o = repair using opening node name\n");
            printf("    -c = repair using closing node name\n");
            return 2;
        }
        int status = repair(argv[3], argv[4]);
        if(status == 1){
            printf("Repair complete.\n");
        }
        else{
            printf("ERROR.\n");
        }
    }

    return 0;
}