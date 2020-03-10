export const ClusterOnly = () => (_target: object, _name: PropertyKey, descriptor: PropertyDescriptor) => {
    if (!process.env.PM2_HOME) {
        descriptor.value = () => ({ message: 'Disabled in standalone mode' });
    }

    return descriptor;
};
