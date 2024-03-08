class LinkedList{
    constructor(){
        this.head = null;
        this.tail = null;
    }
    add(a){
        const newNode = new Node(a);
        if(this.head===null||this.tail === null){
            this.head = newNode;
            this.tail = newNode;
            return;
        }        
        this.tail.next = newNode;
        this.tail = newNode;
    }
    pop(){
    
    }
}


class Node{
    constructor(a=null){
        this.data = a;
        this.next = null;
    }
}