const errorHandler = (error: Error | {}) => {
    console.error('Something went wrong processing files');
    try {
        console.error(JSON.stringify(error, null, 2));
    } catch (e) {
        console.error(error);
    }
    process.exit(1);
};

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);
