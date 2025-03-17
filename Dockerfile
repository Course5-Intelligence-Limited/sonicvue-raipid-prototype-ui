# Install dependencies
RUN npm install --legacy-peer-deps
 
# Build the application
RUN npm run build
 
# Expose the port
EXPOSE 3000
 
# Start the application
CMD ["npm", "run", "dev"]