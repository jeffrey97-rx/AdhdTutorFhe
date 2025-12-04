# AdhdTutorFhe

A privacy-preserving personalized tutoring platform for ADHD students, leveraging Fully Homomorphic Encryption (FHE) to provide individualized learning strategies while protecting sensitive student data. The platform enables secure analysis of encrypted learning metrics and attention patterns to adapt tutoring sessions in real-time without exposing personal information.

## Project Background

Traditional personalized tutoring platforms face challenges in supporting students with ADHD:

- **Data sensitivity**: Student learning data and attention metrics are highly confidential.  
- **Limited personalization**: Standard methods often rely on observable patterns without secure data aggregation.  
- **Privacy concerns**: Sharing data with external educators or analytics tools can expose sensitive information.  
- **Adaptive learning challenges**: Real-time adaptation requires analyzing granular performance data.

AdhdTutorFhe solves these challenges by:

- Encrypting student learning and attention data using FHE  
- Performing secure computations on encrypted data to generate personalized tutoring plans  
- Preserving privacy while allowing adaptive teaching strategies  
- Providing actionable insights without ever decrypting sensitive information

## Features

### Core Functionality

- **Encrypted Data Analysis**: Collects and processes encrypted learning metrics and attention signals.  
- **Personalized Tutoring Plans**: FHE computation generates tailored exercises, schedules, and interventions.  
- **Adaptive Learning**: Real-time adjustment of difficulty, pacing, and content based on encrypted metrics.  
- **Progress Monitoring**: Aggregate performance tracking while keeping individual data private.  
- **Teacher Insights Dashboard**: Visualizes anonymized recommendations and trends for effective intervention.

### Privacy & Security

- **Client-Side Encryption**: All student data encrypted before leaving the device.  
- **FHE-Based Computation**: Analysis is done on encrypted data, preventing exposure.  
- **Immutable Records**: Learning interactions and outcomes are securely logged.  
- **Anonymity by Design**: Student identities remain confidential throughout the platform.  
- **Data Integrity**: Ensures that adaptive strategies are applied consistently without data leakage.

## Architecture

### Backend Services

- **Encrypted Learning Engine**: Processes encrypted metrics to generate personalized interventions.  
- **FHE Computation Module**: Executes all learning strategy calculations on encrypted datasets.  
- **Progress Aggregator**: Summarizes learning outcomes and provides actionable insights while maintaining privacy.  
- **Recommendation Engine**: Generates tailored exercises and feedback for each student.

### Frontend Application

- **React + TypeScript**: Interactive and responsive interface for students and educators.  
- **Visualization Tools**: Displays anonymized trends, progress, and recommendations.  
- **Real-Time Feedback**: Adjusts learning tasks and exercises based on encrypted computations.  
- **Secure Communication**: End-to-end encryption of all interactions between client and backend.

## Technology Stack

### Backend

- **Node.js 18+**: Server-side logic and orchestration.  
- **FHE Libraries**: Enables computation on encrypted data.  
- **Secure Database**: Stores encrypted student data with immutability.  

### Frontend

- **React 18 + TypeScript**: Responsive user interface.  
- **Tailwind CSS**: Modern styling and layout.  
- **Charting & Visualization Libraries**: Privacy-preserving progress visualizations.

## Installation

### Prerequisites

- Node.js 18+  
- npm / yarn / pnpm package manager  
- Compatible device for running client-side encryption modules  

### Setup

1. Clone the repository.  
2. Install dependencies using `npm install` or `yarn install`.  
3. Configure FHE computation backend and secure database.  
4. Start the frontend: `npm start` or `yarn start`.  
5. Begin secure, personalized tutoring sessions.

## Usage

- **Login**: Students and educators access the platform securely.  
- **Submit Data**: Students' learning and attention data are encrypted and sent to the server.  
- **Receive Personalized Plan**: FHE generates customized exercises and interventions.  
- **Track Progress**: Monitor improvements via anonymized dashboards.  
- **Adjust Strategies**: Adaptive interventions modify tasks based on encrypted metrics.

## Security Features

- **Full Data Encryption**: All interactions and metrics remain confidential.  
- **Privacy-Preserving Computation**: FHE ensures no raw data is exposed during analysis.  
- **Immutable Logging**: Learning events are tamper-proof.  
- **Anonymity**: Protects identities of students and teachers.  
- **Secure Recommendations**: Only encrypted outputs are processed and shared.

## Future Enhancements

- **AI-Driven Adaptive Tutoring**: FHE-powered AI for richer personalization.  
- **Gamified Learning**: Introduce secure, encrypted game-based exercises.  
- **Cross-Platform Accessibility**: Extend support to mobile and tablet devices.  
- **Federated Learning Integration**: Combine encrypted data from multiple institutions without exposure.  
- **Analytics & Research**: Provide privacy-preserving insights for ADHD educational research.

AdhdTutorFhe empowers educators to deliver highly personalized tutoring for ADHD students while ensuring the utmost privacy and security of sensitive learning data.
