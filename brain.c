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

void help(){
    if(DEBUG){
        printf("Help called!\n");
    }
    printf("These are the commands you can run!\n");
    printf("help\nvalidate\n");
}

int add(char* myPath){
    if(DEBUG){
        printf("Add called on: %s", myPath);
    }

    if(validate(myPath) == 0){
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

    //Now, we need to start searching through.
    Stack s;
    init(&s);
    bool valid = true;

    char* token = strtok(doc, "\n");

    while ((token = strtok(NULL, "\n")) != NULL) {
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
                        strcpy(badOpenTag, actualTop);
                        strcpy(badCloseTag, tagName);
                    }

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
            printf("    @INVALID XML DOCUMENT\n");
            printf("    @ERROR AT NODE : %s\n", badOpenTag);
            printf("    @CLOSING TAG : %s\n", badCloseTag);
        }
        if(status == 1){
            printf("    @VALID XML DOCUMENT\n");
        }
    }
    else if(strcmp(command, "add") == 0){
        if(argc < 6){
            printf("To add, please use: './brain.exe add -p <path> <parentName> <childName> -v <value>");
            return 2;
        }
        int status = add(argv[3]);
    }

    return 0;
}