import { Requisition } from "./manager.global";

/**
 * lower values have higher priority
 */
export class PriorityQueue<T> {
    private heap: [number, T][] = [];

    constructor() { }

    private getParentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private getLeftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    private getRightChildIndex(index: number): number {
        return 2 * index + 2;
    }

    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    /**
     * Adds an item to the queue with the given priority
     * @param item item to enqueue
     * @param priority priority where lower value has higher priority
     */
    public enqueue(item: T, priority: number): void {
        this.heap.push([priority, item]);
        this.heapifyUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the item with the highest priority (lowest number)
     * @returns item with the highest priority
     */
    public dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop()![1];

        const item = this.heap[0][1];
        this.heap[0] = this.heap.pop()!;
        this.heapifyDown(0);
        return item;
    }

    /**
     * read highest priority item
     * @returns the highest priority item without removing it.
     */
    public peek(): T | undefined {
        return this.isEmpty() ? undefined : this.heap[0][1];
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private heapifyUp(index: number): void {
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }

    private heapifyDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);
            let smallestIndex = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex === index) break;

            this.swap(index, smallestIndex);
            index = smallestIndex;
        }
    }
}

export const priorityQueue = new PriorityQueue<Requisition>();
