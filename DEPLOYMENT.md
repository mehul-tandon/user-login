# Deployment Guide

This guide covers deploying your authentication system to various cloud platforms.

## 🚀 Vercel Deployment (Recommended)

Vercel is the easiest platform for deploying this application.

### Prerequisites
- Vercel account (free tier available)
- Vercel CLI installed: `npm i -g vercel`

### Step-by-Step Deployment

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy the Application**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   In your Vercel dashboard, go to your project settings and add:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   NODE_ENV=production
   BCRYPT_ROUNDS=12
   ```

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update DNS settings as instructed

### File Storage on Vercel

⚠️ **Important**: Cloud functions are stateless, so file storage won't persist between deployments. For production, consider:

1. **Vercel KV (Redis-compatible)**
   ```bash
   npm install @vercel/kv
   ```

2. **Vercel Postgres**
   ```bash
   npm install @vercel/postgres
   ```

3. **External Storage Services**
   - Firebase Firestore
   - MongoDB Atlas
   - Supabase

## 🌐 Netlify Deployment

### Prerequisites
- Netlify account
- Netlify CLI: `npm i -g netlify-cli`

### Deployment Steps

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   netlify deploy --prod
   ```

3. **Set Environment Variables**
   In Netlify dashboard > Site settings > Environment variables:
   ```
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   NODE_ENV=production
   ```

### Netlify Functions

For Netlify, you may need to adapt the API structure to use Netlify Functions format.

## ☁️ AWS Lambda Deployment

### Using Serverless Framework

1. **Install Serverless**
   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml**
   ```yaml
   service: auth-system
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
   
   functions:
     api:
       handler: index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
   ```

3. **Deploy**
   ```bash
   serverless deploy
   ```

## 🔧 Production Considerations

### Security
- Use strong, unique JWT secrets
- Enable HTTPS only
- Set up proper CORS policies
- Implement rate limiting
- Use environment variables for all secrets

### Storage
- For production, replace file storage with a database
- Consider using managed services like:
  - Vercel KV/Postgres
  - Firebase Firestore
  - MongoDB Atlas
  - Supabase

### Monitoring
- Set up logging (Winston is already configured)
- Monitor API endpoints
- Set up error tracking (Sentry, etc.)
- Monitor performance metrics

### Scaling
- Cloud functions auto-scale
- Consider caching strategies
- Optimize cold start times
- Monitor function execution times

## 🔍 Testing Deployment

After deployment, test these endpoints:

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **User Registration**
   ```bash
   curl -X POST https://your-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Password123!"}'
   ```

3. **User Login**
   ```bash
   curl -X POST https://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123!"}'
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all required env vars are set in your platform
   - Check variable names match exactly

2. **CORS Issues**
   - Verify CORS settings in your serverless functions
   - Check if your frontend domain is allowed

3. **File Storage Issues**
   - Remember that cloud functions are stateless
   - Implement proper database storage for production

4. **Cold Start Performance**
   - Consider keeping functions warm
   - Optimize bundle size
   - Use connection pooling for databases

### Getting Help

- Check platform-specific documentation
- Review function logs in your deployment platform
- Test locally first with `npm start`
- Ensure all dependencies are properly installed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
