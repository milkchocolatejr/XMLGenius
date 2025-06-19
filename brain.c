#include <stdio.h>
#include <string.h>

void help(){
    printf("You need help!\n");
}

void validate(char* myPath){
    printf("You would like to validate %s, right?\n", myPath);
}

int main(int argc, char *argv[]){
    printf("Welcome to the brains of the operation!\n");
    
    if(argc < 2){
        printf("You didn't tell me what to do :c");
        return 0;
    }

    //Command Parsing

    char* command = argv[1];
    if(strcmp(command, "help") == 0){ //Two strings are identifcal
        if(argc != 2){
            printf("For help, please use: './brain.o help'.\n");
            return 0;
        }
        help();
    }
    else if(strcmp(command, "validate") == 0){
        if(argc != 4){
            printf("To validate, please use: './brain.o validate -p <path>\n");
            return 0;
        }
        validate(argv[3]);
    }

    return 0;
}