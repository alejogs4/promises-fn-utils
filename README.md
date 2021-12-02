# Promises fn utils

This package is intended to provide a wide a variety of decorator functions to easily add capabilities to your functions which returns promises and this without modify the function's interface.

#Holaaaaaaaaaaaaaaaa
#ooooooooo
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

## retry
createRetryPolicy decorator allows to create a custom retry policy which can be applied to as many function as desired, the resulting retry function can be applied to any function and as this function gets executed and it fails it will be retried as many times as it was indicated at the retry options, besides in order to have a more robust retry system some delay can be applied before a retry attempt is performed and this delay time will be increased by a given factor in every attempt, the factor time is 2 applying the [exponential backoff algorithm](https://en.wikipedia.org/wiki/Exponential_backoff)

```javascript
import { createRetryPolicy } from 'promises-fn-utils'

const applyRetryPolicy = createRetryPolicy({ retries: 3, retryTime: 200 });

const getPostByIDWithRetries = applyRetryPolicy(getPostByID)

// And this policy can be applied to any function you desired
const fetchImportantStuff = applyRetryPolicy(fetcherFunction)

// Now you can use getPostByIDWithRetries and it will retry three times before throwing an error
await getPostByIDWithRetries(42)
```

In the example above the function `getUserByIDWithRetries()` will retry three times before throwing an error, these retries attempts will be delayed by 200ms and doubled by every attempt so in the first attempt will wait 200ms in the second one 400ms and in the final one 800ms, this is an exponential backoff and can be customized with the option `retryFactor`

```javascript
import { createRetryPolicy } from 'promises-fn-utils'

const applyRetryPolicy = createRetryPolicy({ retries: 3, retryTime: 200, retryFactor: 4 });

const getPostByIDWithRetries = applyRetryPolicy(getPostByID)
await getPostByIDWithRetries(42)
// First attempt delay: 200ms
// Second attempt delay: 800ms
// Third attempt delay: 2400ms
```

Sometimes and based on our needs some retries make not sense, in order to customize if an attempt is necessary you can passed `shouldRetry` option

```javascript
import { createRetryPolicy } from 'promises-fn-utils'

const applyRetryPolicy = createRetryPolicy({
  retries: 3,
  retryTime: 200,
  shouldRetry: err => err.status !== 404
});

const getPostByIDWithRetries = applyRetryPolicy(getPostByID)
await getPostByIDWithRetries(42)
```

`shouldRetry` is a predicate function that it will signal if a new retry make sense, in this case it will make a retry as long as the status error is different to 404(not found http status code), by default `shouldRetry` is not mandatory and returns true.

#### Retry setup
| Name        | Optional           | Default  | Description  |
| ------------- |:-------------:| -----:| -----:|
|  retries     			| false 				| None | retry attempts before throwing an error |
| retryTime      | false      | None  | Initial delay time before a retry attempt is performed |
| retryFactor      | true      | 2  | Increase factor for attempt's delay time |
| shouldRetry      | true      | () => true  | Predicate function which signal if an attempt must be performed |

## batching
Batching is a strategy which allows to combine several identical incoming operations into a single one

```javascript
import { createBatchedPromise } from 'promises-fn-utils'

const batchedPostFetcher = createBatchedPromise(getPostByID);

// Application spot 1
const post = await batchedPostFetcher(11)

// Application spot 2
const post = await batchedPostFetcher(11)

// Two operations executed but just one is being executed in the background at the time, the result will be send to both calling places
```

In the example above if two or more parts of the application execute at the same time the same function with the same parameters only one operation will be performed and the result will be distributed with all the callers.

This applies too if the same operation is executed before the last executed one has finished.

## Queuing
Sometimes when concurrency plays a role in the system some shared state is unavoidable so in order to avoid race conditions we can queue all the incoming operations thus just one operation is apply over the shared state at the same time `queuingTask()` function makes this

```javascript
import { queuingTask } from 'promises-fn-utils'

const queuedTask = queuingTask(delay)

await Promise.all([
  queuedTask(1000),
  queuedTask(1000),
  queuedTask(1000),
  queuedTask(1000),
])
// This will take 4000ms
```

Despite the fact that Promise.all runs the promises in parallel, `queuingTask()` makes sure that the executions are made in order and just one at the time, this of course has a cost in performance as a  trade off with safety modifying a shared state, be cautious about using this.

## Once
Some operation we might want to be executed just once in a certain flow so in order to handle this `justOnce()` function offers an interface to ensure that the decorated function is executed just once and in case we want to reset this we can make it with `reset()` function

```javascript
import { justOnce } from 'promises-fn-utils'

const sendEmailOnlyOnce = justOnce(sendEmail)

// Application flow 1 ...
sendEmailOnlyOnce() // no matter how many times this is executed, this will send the email just once

// Another application flow ...
// Reset state, next time Application flow 1 is executed the email will be sent again
sendEmailOnlyOnce.reset()
```
