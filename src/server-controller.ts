const fs = require('fs');

export class ServerController {
    /**
     * this class is responsible for handling requests to the server
     * it contains the anagram index and the word cache
     */

    wordCache: Map<string, string[]>;
    anagramIndex: Map<string, string[]>;
    requestTimes: number[] = [];
    totalRequests: number = 0;
    totalWords: number;

    constructor(private dbFilePath: string) {
        this.dbFilePath = dbFilePath;
        this.createAnagramIndex();
    }

    createAnagramIndex() {
        /** 
         * this function reads the dictionary file and creates the anagram index
         * the anagram index is a map of signatures to arrays of words
         * the signature is used to group words that are anagrams (permutations) of each other
         */
        this.wordCache = new Map<string, string[]>();
        this.anagramIndex = new Map<string, string[]>();
        const dataBase: string[] = fs.readFileSync(this.dbFilePath, 'utf-8').split('\n');
        const uniqueDataBase = [...new Set(dataBase)];
        uniqueDataBase.forEach((word) => {
            word = word.trim();
            const signature = this.getFrequencySignature(word)      // O(n)
            // const signature = this.getSortedWordSignature(word)  // O(n log n)
            if (!this.anagramIndex.has(signature)) {
                this.anagramIndex.set(signature, []);
            }
            this.anagramIndex.get(signature)?.push(word);
        });
        this.totalWords = dataBase.length;
    }

    getSortedWordSignature(word: string): string {
        return word.split('').sort().join('');
    }

    getFrequencySignature(word: string): string {
        /**
         * this function generates a signature for a word 
         * by counting the frequency of each character
         * complexity: O(n), (O(1) for sorting the keys)
         */
        const histogram = new Map<string, number>();
        for (const char of word) {
            histogram.set(char, (histogram.get(char) || 0) + 1);
        }
        const sortedChars = Array.from(histogram.keys()).sort();
        let signature = '';
        for (const char of sortedChars) {
            signature += char + histogram.get(char);
        }
        return signature;
    }

    findSimilarWords(word: string): string[] {
        if (this.wordCache.has(word)) {
            return this.wordCache.get(word);
        }
        const similarWords = this.anagramIndex.get(this.getFrequencySignature(word)) || [];
        const result = similarWords.filter((w) => w !== word);
        this.wordCache.set(word, result);
        return result;
    }
    
    calculateRequestTime(startTime: [number, number] = [0, 0], endTime: [number, number] = [0, 0]) {
        const elapsedTime = ((endTime[0] - startTime[0]) * 1e9) + (endTime[1] - startTime[1]);
        this.requestTimes.push(elapsedTime)
    }

    getAverageProcessingTimeNs(): number {
        /**
         * this function calculates the average processing time of all requests
         * the average is rounded down to the nearest integer
         */
        if (this.totalRequests === 0) return 0
        const averageTimeNs = this.requestTimes.reduce((a, b) => a + b, 0) / this.totalRequests
        return Math.floor(averageTimeNs)
    }
}