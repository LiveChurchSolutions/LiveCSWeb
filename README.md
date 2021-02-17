# ChumsWeb
Brochure site that contains registration (<a href="https://chums.org/">chums.org</a>)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).

## Dev Setup Instructions
### Using Docker
The easiest way to get the project set up for local development is to use the [Docker setup instructions](https://github.com/LiveChurchSolutions/Docker), with the "Chums" container.

### Manual Setup
This project depends on several APIs.  You may either set them up on your local machine first, or point to the staging server copies during development.  The staging server urls are in the sample dotenv files.
1. Copy `dotenv.sample.txt` to `.env` and updated it to point to the appropriate API urls. 
2. Pull the [appBase](https://github.com/LiveChurchSolutions/AppBase) submodule with: `git submodule init && git submodule update`
3. Install the dependencies with: `npm install`
4. Run `npm start` to launch the project.
