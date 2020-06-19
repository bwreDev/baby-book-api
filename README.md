# Baby Book Api

This is the Express server API for my full stack capstone project.

It is utilized by my React client at [baby-book-app](https://github.com/cbonner26118/baby-book-app).

Live production of the app can be found at [https://baby-book-app.now.sh/](https://baby-book-app.now.sh/).
![splash-page](SplashPage.PNG)

## Tech

This back end is built using Node.js, Express, and PostgreSQL

# Built using my Express Boilerplate!

This is a [boilerplate](https://github.com/cbonner26118/express-boilerplate) project used for starting new projects!

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Migrate SQL server scripts `npm run migrate`

Migrate test SQL server scripts `npm run migrate:test`

Migrate production SQL server scripts `npm run migrate:production`

Run an audit and migrate to production, then push to production on Heroku `npm run deploy`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
