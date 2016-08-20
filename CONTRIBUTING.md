# Contributing to Butter

So you're interested in giving us a hand? That's awesome! We've put together some brief guidelines that should help
you get started quickly and easily.

There are lots and lots of ways to get involved, this document covers:

* [Raising issues](#raising-issues)
 * [Report a bug](#report-a-bug)
 * [Suggest enhancements](#feature-requests)
* [Working on Butter](#working-on-butter)
 * [The guidelines](#the-guidelines)
 * [Submit new code](#submit-new-code)
 * [Translate](#translate)
* [Build and debug](#build-and-debug)
 * [Updating with the latest changes](#updating-with-the-latest-changes)

## Raising issues

If you're about to raise an issue because you think that you've found a problem with Butter, or you'd like to make a request
for a new feature in the codebase, or any other reason… please read this first.

The GitHub issue tracker is the preferred channel for [bug reports](#report-a-bug),
[feature requests](#feature-requests), [change requests](#change-requests) and [submitting pull
requests](#submitting-pull-requests), but please respect the following restrictions:

* Please **search for existing issues**. Help us keep duplicate issues to a minimum by checking to see if someone
has already reported your problem or requested your idea.

* Please **do not** use the issue tracker for personal support requests (use
  [the github issues](http://github.com/butterproject/butter-desktop/issues) or IRC - #butterproject on freenode).

* Please **do not** derail or troll issues. Keep the discussion on topic and respect the opinions of others.

### Report a bug

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the latest `master` or look for [closed issues](https://github.com/butterproject/butter-desktop/issues?q=is%3Aissue+is%3Aclosed).

3. **Include a screencast if relevant** - Is your issue about a design or front end feature or bug? The most helpful thing in the world is if we can *see* what you're talking about. Just drop the picture after writing your issue, it'll be uploaded and shown to the developpers.

3. Use the Issue tab on Github to start [creating a bug report](https://github.com/butterproject/butter-desktop/issues/new). A good bug report shouldn't leave others needing to chase you up for more information. Be sure to include all the possible required details and the steps to take to reproduce the issue.

### Feature Requests

Feature requests are welcome. Before you submit one be sure to have:

1. **Use the [Github Issues search](https://github.com/butterproject/butter-desktop/issues?utf8=%E2%9C%93&q=is%3Aissue)** and check the feature hasn't already been requested.
2. Take a moment to think about whether your idea fits with the scope and aims of the project, or if it might
better fit being an app/plugin.
3. Remember, it's up to *you* to make a strong case to convince the project's leaders of the merits of this
feature. Please provide as much detail and context as possible, this means explaining the use case and why it is
likely to be common.
4. Clearly indicate whether this is a feature request for the application itself, or for packages like Providers, Metadatas, or other.


## Working on Butter

You're welcome to work with us and the community to build the application and take it the new highs!

### The guidelines

Pull requests are awesome. If you're looking to raise a PR for something which doesn't have an open issue, please think carefully about [raising an issue](#report-a-bug) which your PR can close, especially if you're fixing a bug. This makes it more likely that there will be enough information available for your PR to be properly tested and merged. To make sure your PR is accepted as quickly as possible, you should be sure to have read all the guidelines on:

* [code standards](docs/Code-Standards.md)
* [commit messages](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md#commit-messages)
* [not breaking the build](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md#check-it-passes-the-tests)

### Translation

For translations please go to: [Transifex](https://www.transifex.com/butterproject/public/)

## Build and debug

Want to build yourself to practice and discover how the magic happens? Or maybe you have developped new code and wonder how to distribute a test binary?

1. Clone the git repo, to get the Butter source code
1. `cd` into the project folder
1. Run `npm install -g gulp-cli` - to make it possible to run gulp commands
1. Run `npm install` - to get all the dependencies
1. Run `gulp build`

[Complete documentation](docs/Build-Debug.md).

### Updating with the latest changes

Pulling down the latest changes from master will often require more than just a pull, you may also need to do one or more of the following:

 * `npm install && npm update` - fetch any new dependencies
 * `gulp css` - rebuild the css files
 * `gulp run` - launches the application