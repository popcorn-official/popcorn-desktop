# Contributing to Butter

So you're interested in giving us a hand? That's awesome! We've put together some brief guidelines that should help
you get started quickly and easily.

There are lots and lots of ways to get involved, this document covers:

* [raising issues](#report-a-bug)
    * [bug reports](#bug-reports)
    * [feature requests](#feature-requests)
    * [change requests](#change-requests)
* [working on Butter core](#working-on-butter-core)
    * [submitting pull requests](#submitting-pull-requests)
* [translation](#translation)


## Report a bug

If you're about to raise an issue because you think that you've found a problem with Butter, or you'd like to make a request
for a new feature in the codebase, or any other reason… please read this first.

The GitHub issue tracker is the preferred channel for [bug reports](#bug-reports),
[feature requests](#feature-requests), [change requests](#change-requests) and [submitting pull
requests](#submitting-pull-requests), but please respect the following restrictions:

* Please **search for existing issues**. Help us keep duplicate issues to a minimum by checking to see if someone
has already reported your problem or requested your idea.

* Please **do not** use the issue tracker for personal support requests (use
  [the github issues](http://github.com/butterproject/butter-desktop/issues) or IRC - #butterproject on freenode).

* Please **do not** derail or troll issues. Keep the discussion on topic and respect the opinions of others.

### Bug Reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the latest `master` or look for [closed issues](https://github.com/butterproject/butter-desktop/issues?q=is%3Aissue+is%3Aclosed).

3. **Include a screencast if relevant** - Is your issue about a design or front end feature or bug? The most helpful thing in the world is if we can *see* what you're talking about.
Use [LICEcap](http://www.cockos.com/licecap/) to quickly and easily record a short screencast (24fps) and save it as an animated gif! Embed it directly into your GitHub issue. Kapow.

3. Use the Bug Report template below to start creating a bug report with the template automatically or [click here](http://bit.ly/1MhADoe). 

A good bug report shouldn't leave others needing to chase you up for more information. Be sure to include the details of your environment.

Template Example :
```
Short and descriptive example bug report summary (title)

### Environment

The OS environment in which the issue occurs. 

### Steps to Reproduce
If suitable, include the steps required to reproduce the bug.

1. This is the first step
2. This is the second step
3. Further steps, etc.

Any other information you want to share that is relevant to the issue being reported. Especially, why do you consider this to be a bug? What do you expect to happen instead?

### Technical details:

* Butter Version: stable 0.3.7
* Downloaded from: butterproject.org
* Connection: 10mbs
* OS: MAC OSX
```

### Feature Requests

Feature requests are welcome. Before you submit one be sure to have:

1. Read the [Roadmap](https://github.com/butterproject/butter-desktop/tree/master/docs/RoadMap.md) and
[Planned Features](https://github.com/butterproject/butter-desktop/tree/master/docs/Planned-Features.md) listing, **use the Github Issues search** and check the feature hasn't already been requested.
2. Take a moment to think about whether your idea fits with the scope and aims of the project, or if it might
better fit being an app/plugin.
3. Remember, it's up to *you* to make a strong case to convince the project's leaders of the merits of this
feature. Please provide as much detail and context as possible, this means explaining the use case and why it is
likely to be common.
4. Clearly indicate whether this is a feature request for Core, or for packages.


### Change Requests

Change requests cover both architectural and functional changes to how Butter works. If you have an idea for a
new or different dependency, a refactor, or an improvement to a feature, etc  - please be sure to:

1. **Use the GitHub search** and check someone else didn't get there first
2. Take a moment to think about the best way to make a case for, and explain what you're thinking. Are you sure
this shouldn't really be a [bug report](#bug-reports) or a [feature request](#feature-requests)? Is it really one
idea or is it many? What's the context? What problem are you solving? Why is what you are suggesting better than
what's already there? Does it fit with the Roadmap?


### Submitting Pull Requests

Pull requests are awesome. If you're looking to raise a PR for something which doesn't have an open issue, please think carefully about [raising an issue](#report-a-bug) which your PR can close, especially if you're fixing a bug. This makes it more likely that there will be enough information available for your PR to be properly tested and merged. To make sure your PR is accepted as quickly as possible, you should be sure to have read
all the guidelines on:

* [code standards](https://github.com/butterproject/butter-desktop/tree/master/docs/Code-Standards.md)
* [commit messages](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md#commit-messages)
* [cleaning-up history](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md#clean-up-history)
* [not breaking the build](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md#check-it-passes-the-tests)

##### Need Help?

If you're not completely clear on how to submit / update / *do* Pull Requests, please check out our in depth
[Git Workflow guide](https://github.com/butterproject/butter-desktop/tree/master/docs/Git-Workflow.md) for Butter.


### Translation

For translations please go to: [Transifex](https://www.transifex.com/butterproject/public/)


## Working on Butter Core

**Pre-requisites:**

* Node 0.10.x

### Installation / Setup Instructions

1. Check you have the pre-requisites listed above!
1. Clone the git repo
1. cd into the project folder
1. Run `npm install -g grunt-cli bower` - to make it possible to run grunt commands

[complete documentation](https://github.com/butterproject/butter-desktop/tree/master/docs/Build-Debug.md).

### Updating with the latest changes

Pulling down the latest changes from master will often require more than just a pull, you may also need to do one or more of the following:

 * `npm install` - fetch any new dependencies
 * `grunt stylus` - rebuild the css files


## Contributor License Agreement

By contributing your code to Butter you grant the Butter Project a non-exclusive, irrevocable, worldwide,
royalty-free, sublicenseable, transferable license under all of Your relevant intellectual property rights
(including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and
publicly perform and display the Contributions on any licensing terms, including without limitation:
(a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the
licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the
above license. If Your employer has rights to intellectual property that You create, You represent that You have
received permission to make the Contributions on behalf of that employer, or that Your employer has waived such
rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person
claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also
represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that
conflicts with the terms of this license.

The Butter Project acknowledges that, except as explicitly described in this Agreement, any Contribution which
you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS
FOR A PARTICULAR PURPOSE.
