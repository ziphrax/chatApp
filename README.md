Dave's Chat App
==============================

A simple chat application using sockets to send messages between clients and the server.

## 🚀 Getting Started

### Running with Docker Compose

The easiest way to start the application is using Docker Compose, which will automatically set up both the Node.js application and MongoDB database:

```bash
docker-compose up
```

This will:
- Start a MongoDB container on port 27017
- Build and start the chat application on port 3000
- Create a network for the containers to communicate

To run in detached mode (background):
```bash
docker-compose up -d
```

To stop the application:
```bash
docker-compose down
```

Once running, access the chat application at: `http://localhost:3000`

## 📚 Documentation

The `_documentation/` folder contains detailed information about the project:

### [Feature Plans](/_documentation/FeaturePlans.md)
Outlines upcoming features and enhancements planned for the chat application, including:
- **WebRTC Integration**: Real-time peer-to-peer communication capabilities
- Implementation roadmaps and technical considerations
- Expected benefits and user experience improvements

### [Scaling Plans](/_documentation/ScalingPlans.md)
Strategies for optimizing performance and scaling the application, covering:
- **Performance Optimization**: Clustering, Redis integration, database optimization
- **Horizontal Scaling**: Load balancing and multi-server setup strategies
- **Capacity Planning**: Expected user capacity improvements and implementation priorities

## 🔧 Development

Planning on adding the ability to send and receive email using nodejs. Options include:
 - http://mailin.io/
 - https://haraka.github.io/
 - maildev
 - nodemailer
 - simple smtp etc.