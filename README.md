# Lingo

Originally built from the MEAN Stack:

- **M**ongoDB : Document database – used by your back-end application to store its data as JSON (JavaScript Object Notation) documents
- **E**xpress (sometimes referred to as Express.js): Back-end web application framework running on top of Node.js
- **A**ngular (formerly Angular.js): Front-end web app framework; runs your JavaScript code in the user's browser, allowing your application UI to be dynamic
- **N**ode.js : JavaScript runtime environment – lets you implement your application back-end in JavaScript

## Build tools (needed to build):

1. NVM (node version manager recomended)
   https://github.com/nvm-sh/nvm
   This helps manage different nodejs installations. After installing nvm, install nodejs 10.15.3 (also installs npm)
   `$ nvm install 10`

2. Yarn (dependency management, built on top of npm)
   https://yarnpkg.com/en/docs/install#debian-stable
   Once yarn is installed `$ yarn install` should install all dependencies as listed in package.json

## Test Build and Run

Once dependencies are downloaded, try building with `$ yarn build`.
When the build is successful, launch nodejs with `$ yarn start`.

## Create new Assessment (component)

cd into ScreenerVersion2/src/app/assessments-module (module that contains the assessment components)

run ../../../node_modules/.bin/ng g component

This generates the files for a new angular component and updates the Angular app classes which need to know about its existence

1. Understanding code structure
   - Opinionated Angular Structure (modules, components, services, routing, etc)
   - Inheritence accross Angular components used for assessments
2. Necessary code changes when changing assessments
   - url routing
   - translation function
   - hash key function
   - configurations file
3. Unecessary code changes
