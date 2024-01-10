# Project Description:
Two words w_1 and w_2 are considered similar if w_1 is a letter permutation of w_2 (e.g., "stressed" and "desserts").
Implement a web service for printing similar words in the English language.
The web service should listen on port 8000 and support the following two HTTP endpoints:


GET /api/v1/similar?word=stressed
Returns all words in the dictionary that have the same permutation as the word "stressed". The word in the query should not be returned.
The result format is a JSON object as follows:
```
{

    similar:[list,of,words,that,are,similar,to,provided,word]

}
```
Example:
```
http://localhost:8000/api/v1/similar?word=apple
Returns: {"similar":["appel","pepla"]}
```
```
GET /api/v1/stats
```
Return general statistics about the program:
Total number of words in the dictionary
Total number of requests (not including "stats" requests)
Average time for request handling in nanoseconds (not including "stats" requests)
The output is a JSON object structured as follows:
```
{
    totalWords:int
    totalRequests:int
    avgProcessingTimeNs:int
}
```
Example:
```
http://localhost:8000/api/v1/stats
Returns: {"totalWords":351075,"totalRequests":9,"avgProcessingTimeNs":45239}
```

# Installation Instructions

## Using Docker

1. Navigate to the repository:
    ```
    cd path_to_clean_words_repo
    ```
2. Build the Docker image:
    ```
    docker build -t clean-words .
    ```
3. Run the Docker container:
    ```
    docker run -d -p 8000:8000 clean-words
    ```

## Running Locally

1. Install the latest version of Node. You can find instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).
2. Run the development server:
    ```
    npm run dev
    ```

# Code Structure

- The `server.ts` file is used to manage the routing and the endpoints.
- The `server-controller.ts` file is a class module that is used by the `server.ts`.

# Endpoints

#### GET
 This endpoint is used to find similar words. Replace `[wordInput]` with the word you want to find similar words for.
 ```
 localhost:8000/api/v1/similar?word=[wordInput]
 ```
### GET
This endpoint is used to get statistics.
- `localhost:8000/api/v1/stats`


# Solution Overview

My solution is based on the idea that preloading and preprocessing the DB makes for faster results. It works as follows:

1. We read the DB given the file path.
2. We create a data structure where the keys are determined as follows for a given word:
    - Count each letter's appearance.
    - Sort the letters alphabetically.
    - Append the count to each letter.
    - Return the result as a string.
    - Example: 
        - Given the word from the dictionary "jababa"
        - count_j=1, count_a=3, count_b=2
        - output key: a3b2j1
3. Then for every word in the DB, calculate the key for that word and set it in the data structure.

## Caching

We are also maintaining a cache. If we searched for a similar word before, we simply return the result.

## Finding Similar Words

- Given a word:
    - If the word is in the cache, return the result.
    - Else, calculate the key for that word.
    - Return all the words under that key in the DB (if any exist), excluding the current word.

# Note

- Since I used Node, there was no point in using workers since it's single-threaded. However, I read that in GoLang this is something I should have considered in case parallel requests were received.
- If the DB was much larger, I would probably lazy load each portion into the data structure instead of doing it all at once.
