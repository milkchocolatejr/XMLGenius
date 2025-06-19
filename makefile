runbasic:	
	gcc brain.c -o brain.o
	./brain.o
help: 
	gcc brain.c -o brain.o
	./brain.o help

helpTest:
	gcc brain.c -o brain.o
	./brain.o help please!

validate:
	gcc brain.c -o brain.o
	./brain.o validate -p myPath.txt

validateTest:
	gcc brain.c -o brain.o
	./brain.o validate

