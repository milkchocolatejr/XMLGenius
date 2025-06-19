#ifndef myStack
#define myStack

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SIZE 1000

typedef struct {
    char* data[MAX_SIZE];
    int top;
} Stack;

void init(Stack* s) {
    s->top = -1;
}

int isEmpty(Stack* s) {
    return s->top == -1;
}

int isFull(Stack* s) {
    return s->top == MAX_SIZE - 1;
}

void push(Stack* s, const char* item) {
    if (isFull(s)) {
        printf("Stack overflow! Cannot push '%s'\n", item);
        return;
    }
    s->top++;
    s->data[s->top] = strdup(item);
}

char* pop(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack underflow! Nothing to pop.\n");
        return NULL;
    }
    char* item = s->data[s->top];
    s->top--;
    return item;
}

char* peek(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack is empty.\n");
        return NULL;
    }
    return s->data[s->top];
}

void freeStack(Stack* s) {
    while (!isEmpty(s)) {
        free(pop(s));
    }
}

#endif
