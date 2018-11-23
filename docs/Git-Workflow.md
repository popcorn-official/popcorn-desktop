# Git Workflow

## Commit Messages

1. The **first line should always be 50 characters or less** and that it should be followed by a blank line.

2. Never use the `-m <msg>` / `--message=<msg>` flag to git commit.

  It gives you a poor mindset right off the bat as you will feel that you have to fit your commit message into the terminal command, and makes the commit feel more like a one-off argument than a page in history:

  `git commit -m "Fix login bug"`

  A more useful commit message might be:

  ```
Redirect user to the requested page after login

https://trello.com/path/to/relevant/card

Users were being redirected to the home page after login, which is less
useful than redirecting to the page they had originally requested before
being redirected to the login form.

* Store requested path in a session variable
* Redirect to the stored location after successfully logging in the user
```

3. A git commit should answer the following questions:

  * **Why is this change necessary?**
  
    This question tells reviewers of your pull request what to expect in the commit, allowing them to more easily identify and point out unrelated changes.

  * **How does it address the issue?**
  
    Describe, at a high level, what was done to affect change. `Introduce a red/black tree to increase search speed` or `Remove <troublesome X>, which was causing <specific description of issue introduced by Y>` are good examples.

  * **What side effects does this change have?**
  
    This is the most important question to answer, as it can point out problems where you are making too many changes in one commit or branch. One or two bullet points for related changes may be okay, but five or six are likely indicators of a commit that is doing too many things.

## Clean Up History

`TODO`

## Check It Passes The Tests

`TODO`

***

Sources:

* https://robots.thoughtbot.com/5-useful-tips-for-a-better-commit-message
