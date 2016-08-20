# Code Standards

Coding isn't only about writing working lines, it's also creating code that can be read and understood by others.
- Consistency and conventions are fundamental for any projects
- Good code is as simple and clear as possible
- Readability is critical

***

## Summary
* [Indentation](#indentation)
* [Readability](#readability)
* [NPM modules](#npm-modules)
 * [Using modules](#using-modules)
 * [Creating modules](#creating-modules)
* [JavaScript](#javascript)
 * [Formatting JavaScript](#formatting-javascript)
 * [Variable declaration](#variable-declaration)
 * [Comments](#comments)
 * [Variable and function names](#variable-and-function-names)
 * [Callbacks vs. Promises](#callbacks-vs-promises)
 * [Filenames](#file-names)
* [Providers, Streamers, Components](#providers-streamers-components)

***

## Indentation
We use **soft tabs** comprised of **four spaces per tab**. 

Hitting the Tab key should generate four space characters rather than one tab character. This allows code to appear the same on all platforms.

## Readability
We encourage the use of:
- **whitespace**
- **comments**
- **descriptive variable names**

The ability for another developer to read the code and understand it at first sight is paramount above code length concerns.

&#9745; Correct:
```js
    // adds two number and returns their sum
    function addTwoNumbers (num1, num2) {
        // print
        console.log('Adding %d to %d', num1, num2);

        // calculate
        var addition = num1 + num2;
        
        // return
        return addition;
    }
```

&#9746; Incorrect:
```js
    function j(a,b){var z = a+b;return z;}
```

***

## NPM Modules
We encourage the use and creation of **npm modules**. 

Don't reinvent the wheel: if someone else already solved your problem, and offers it to the community, you should use it. 
In the same way, if you can solve a problem that other developers might be interested in, why not give back to the community by creating a module ?

#### Using modules
We encourage the use of existing modules, if it fits a particular need and isn't overkill.

&#9745; Correct:
- The module greatly reduces the amount of code you're writing
- The module improves readability and effectiveness of your code
- The module is or will be used on multiple places in the project

&#9746; Incorrect:
- The module does a lot of things and you only use 2 lines of code from it (_Take those 2 lines and include them in your code, with proper credits_)
- The module is a fork you created 10mins ago because it was lacking a feature (_PR your changes upstream and use the official module instead_)
- The module isn't maintained anymore (_Use a different module or handle the maintenance yourself, if it breaks in a near future, your code will break too_)

#### Creating modules
If you can, creating a module that will be re-usable and useful outside of the project is a great addition to the open-source world.
Be wary of how you host it: don't publish it on your name if you don't intend to maintain it. Prefer asking the project to host and maintain it. Otherwise your code might (and probably will) break.

***

## JavaScript

#### Formatting JavaScript
The use of whitespace should follow human language writing conventions, with blank lines between ideas and groups of code, for readability.

- **Open braces** are preceded by a single space and appear on the same line as the preceding argument.
- **Close braces** appear at the same indentation as the statement containing the opening brace.
- There are no space characters between **parentheses** and their content.
- Use **semicolons**.
- Each **comma** and **colon** are followed by a single space.
- **Binary** and **ternary operators** have a single space on each side.
- **Quoted values** should be in 'single quotes' so that '"double" quotes' may exist inside them.
- **Comment** your code thoroughly.
- Each segment of a **boolean expression** should be enclosed in parentheses.

&#9745; Correct:
```js
    // variable declaration
    var zeroToThree = [0,1,2,3],
        total = 0;

    // loop and add values
    for (var i = 0; i < zeroToThree.length; i++) {

        // add the value to total
        total += zeroToThree[i];

        // print added number
        console.log('"%d" added to total', zeroToThree[i]);

        // print total when exiting the loop
        if (((i + 1) === zeroToThree.length) && !isNaN(total)) {
            console.log('Loop is over, total = %d', total);
        }
    }
```

#### Variable declaration
Each variable should be declared on its own line, with a single var keyword chaining the declarations.

&#9745; Correct:
```js
    var num1 = 1,
        num2 = 2,
        total;
```

#### Comments
There are two types of comment in JavaScript, the **line comment** and the **block comment**. Both can be used in the project, keeping in mind that readability is the most important.

You should simply follow this example:

```js
    // describe the block of myFunction
    myFunction () {
        var operation = 'some value'; // rare line-specific comment

        // describe the loop function
        for (var things in arr) {
            if (arr[thing] === operation) {

                /** 
                 * this is a really important comment
                 * you don't want readers to miss
                 */
                 console.log('string found at', thing);
            }
        }
    }
```

As a convention, if there is something that will require attention soon, or that does not perfectly work as it, you can use the keyword `TODO` in the comment, with an explanation on what should be done and why.


#### Variable and function names
Always use meaningful variable names that can be read as words, not as an abbreviation only you understand.

- Variable and function names are `camelCase`
- Boolean values should be prefixed with `is`

&#9745; Correct:
```js
    // variables
    var exempleValue = 'my exemple variable value';

    // functions
    function returnZero () {
        return 0;
    }

    // booleans
    var isRunning = true;
```

#### Callbacks vs. Promises
Callbacks are dead, stop writing them. We want **thenable Promises**, to avoid the callback hell, improve readability and produce more compact code.

However, you should not use Promises everywhere: some functions will run perfectly fine while being sync and they should be kept that way. What you should do, is use Promises instead of callbacks, when async is required. That's it.


#### Filenames
The filenames should always be lowercase, using underscore to space it, for example `drag_drop.js`

***

## Providers, streamers, components
For the provider documentation, please see :
* https://github.com/butterproviders/butter-provider
* https://github.com/buttercomponents/butter-component-builder
* https://github.com/butterstreamers

***

Sources: 

- http://www.w3schools.com/js/js_conventions.asp
- http://isobar-idev.github.io/code-standards/
