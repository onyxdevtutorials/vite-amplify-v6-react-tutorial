# Vite Amplify v6 React Tutorial

This app implements a store-type app using React, TypeScript, and AWS Amplify v6. It's for demonstration purposes and goes along with the article [Getting Started with Vite, Vitest, AWS Amplify and React](https://medium.com/@davidavilasilva/getting-started-with-vite-vitest-aws-amplify-and-react-12b7ed337a93). That article contains extensive information about getting up the AWS Amplify services.

## Features

- An admin user can create and update products, including uploading images for the products.
- Users who have signed up can customize their user profiles.
- Signed-in users can rate and review products.
- All users can view products, reviews and user profiles.

## Installation

Run `nvm use` and then `npm install` to install required packages.

The `amplify` directory is there for reference. If you want to build and deploy this project, delete the `amplify` directory. When you do your own `amplify init` -- and the other steps covered in [the article](https://medium.com/@davidavilasilva/getting-started-with-vite-vitest-aws-amplify-and-react-12b7ed337a93) -- a new `amplify` directory will be created, and your app will have resources associated with your own AWS account.

## Usage

Once the required AWS Amplify services are set up, the app can be run locally with `npm run dev`.

Tests can be run with `npm run test` or `npm run coverage`.

The app can also be run as a hosted app, as described in the [article](https://medium.com/@davidavilasilva/getting-started-with-vite-vitest-aws-amplify-and-react-12b7ed337a93).

## License

MIT License

Copyright (c) 2024 David Silva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Future Plans

I may add Stripe payment processing (in a demo mode) in a future release.
