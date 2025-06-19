help: ./brain.c
	gcc brain.c -o brain.o
	./brain.o help

invalidate: ./brain.c ./samples/invalid.xml
	gcc brain.c -o brain.o
	./brain.o validate -p samples/invalid.xml

validate: ./brain.c samples/valid.xml
	gcc brain.c -o brain.o
	./brain.o validate -p samples/valid.xml

invalidated: ./brain.c ./samples/invalid.xml
	gcc brain.c -o brain.o
	./brain.o validate -p samples/invalid.xml -d

validated: ./brain.c samples/valid.xml
	gcc brain.c -o brain.o
	./brain.o validate -p samples/valid.xml -d



