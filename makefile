help: ./brain.c
	make compile
	./brain.exe help

invalidate: ./brain.c ./samples/invalid.xml
	make compile
	./brain.exe validate -p samples/invalid.xml

validate: ./brain.c samples/valid.xml
	make compile
	./brain.exe validate -p samples/valid.xml

invalidated: ./brain.c ./samples/invalid.xml
	make compile
	./brain.exe validate -p samples/invalid.xml -d

validated: ./brain.c samples/valid.xml
	make compile
	./brain.exe validate -p samples/valid.xml -d

compile:
	gcc brain.c -o brain.exe

