# Promises fn utils
This package is intended to provide a wide a variety of decorator functions to easily add capabilities to your functions which returns promises and this without modify the function's interface.

## Installation
```bash
# using npm
npm install promises-fn-utils --save

# using yarn
yarn add promises-fn-utils
```

## caching
createCache decorator allows you to add a cache layer to your function, so if after a call you call the function with the same parameters instead of making the operation again it will be returned from a cache

```javascript
import { createCache } from 'promises-fn-utils'

function getPostByID(postID) {
  return fetch(`/api/post/${postID}`).then(response => response.json())
}

const applyCachePolicy = createCache({ ttl: 900000, maxEntries: 15 })

const cachedGetPostByID = applyCachePolicy(getPostByID)

// in your app
const post =  await cachedGetPostByID(1)
const secondPost =  await cachedGetPostByID(1) // this post will not be retrieved from the api but from the cache
```
#### Cache setup
| Name        | Optional           | Default  | Description  |
| ------------- |:-------------:| -----:| -----:|
|  ttl     			| true 				| None | Time after which cache will be cleared, specified in milliseconds |
| maxEntries      | true      | 15  | Maximum amount of different parameters that can be stored in the cache before being cleared |