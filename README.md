This app uses React, TypeScript, and AWS Amplify v6. It's an exercise for trying out Amplify, Vite, and Vitest. The app itself follows a store kind of model:

- Product, Review and User models.
- An admin user can create and update products.
- Authenticated users can rate and review products.
- All users (including anonymous users) can see products, reviews and user profiles.

At the moment there is no payment processing (even in a demo form) but Stripe may be added later.

The amplify directory is there for reference. If you actually want to build and run the project, you'll have to go through AWS Amplify set up.
