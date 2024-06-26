interface IQueue {
  items: any;
  enqueue: (item: any) => string;
  dequeue: () => any;
  peek: () => any;
  printQueue: any;
}

class Queue implements IQueue {
  items: any;
  frontIndex: number;
  backIndex: number;

  constructor() {
    this.items = {}
    this.frontIndex = 0
    this.backIndex = 0
  }

  enqueue(item: any) {
    this.items[this.backIndex] = item
    this.backIndex++
    return item + ' inserted'
  }

  dequeue() {
    const item = this.items[this.frontIndex]
    delete this.items[this.frontIndex]
    this.frontIndex++
    return item
  }

  peek() {
    return this.items[this.frontIndex]
  }

  get printQueue() {
    return this.items;
  }
}