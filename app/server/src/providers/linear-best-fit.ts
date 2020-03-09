/*
 * https://medium.com/@sahirnambiar/linear-least-squares-a-javascript-implementation-and-a-definitional-question-e3fba55a6d4b
 */
export const findLineByLeastSquares = (valuesY: number[], valuesX?: number[]): { m: number; b: number } => {
    valuesX = valuesX || Array.from(Array(valuesY.length).keys());
    let xSum = 0;
    let ySum = 0;
    let xySum = 0;
    let xxSum = 0;
    let count = 0;

    /*
     * The above is just for quick access, makes the program faster
     */
    let x = 0;
    let y = 0;
    const valuesLength = valuesX.length;

    if (valuesLength != valuesY.length) {
        throw new Error('The parameters valuesX and valuesY need to have same size!');
    }

    /*
     * Above and below cover edge cases
     */
    if (valuesLength === 0) {
        return { b: 0, m: 0 };
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let i = 0; i < valuesLength; i++) {
        x = valuesX[i];
        y = valuesY[i];
        xSum += x;
        ySum += y;
        xxSum += x * x;
        xySum += x * y;
        count++;
    }

    /*
     * Calculate m and b for the line equation:
     * y = x * m + b
     */
    const m = (-1 * (count * xySum - xSum * ySum)) / (count * xxSum - xSum * xSum);
    const b = ySum / count - (m * xSum) / count;

    return { m, b };

    // /*
    //  * We then return the x and y data points according to our fit
    //  */
    // let result_valuesX = [];
    // let result_valuesY = [];

    // for (let i = 0; i < valuesLength; i++) {
    //     x = valuesX[i];
    //     y = x * m + b;
    //     result_valuesX.push(x);
    //     result_valuesY.push(y);
    // }

    // return { m, b };
};

// linear least squares https://en.wikipedia.org/wiki/Linear_least_squares
// derived from https://www.varsitytutors.com/hotmath/hotmath_help/topics/line-of-best-fit
// const init = { mean: 0, total: 0, rise: 0, run: 0, intercept: 0, slope: 0 };

// const MINUTE = 60;
// const FIVE_MINS = 60 * 5;
// const HALF_HOUR = 60 * 30;

// const stats: {
//     [key: string]: typeof init & {
//         last30Min: typeof init;
//         last5Min: typeof init;
//         lastMinute: typeof init;
//     };
// } = {};

// const historyLength = this.queueInfo.history.length;

// for (let i = 0; i < historyLength; i++) {
//     const info = this.queueInfo.history[i];
//     Object.entries(info).forEach(([state, count]) => {
//         if (!stats[state]) {
//             stats[state] = {
//                 ...init,
//                 last30Min: { ...init },
//                 last5Min: { ...init },
//                 lastMinute: { ...init },
//             };
//         }
//         stats[state].total += count;

//         if (i > historyLength - HALF_HOUR) {
//             stats[state].last30Min.total += count;
//         }
//         if (i > historyLength - FIVE_MINS) {
//             stats[state].last5Min.total += count;
//         }
//         if (i > historyLength - MINUTE) {
//             stats[state].lastMinute.total += count;
//         }
//     });
// }

// Object.keys(stats).forEach(state => {
//     stats[state].mean = stats[state].total / historyLength;
//     stats[state].last30Min.mean = stats[state].total / HALF_HOUR;
//     stats[state].last5Min.mean = stats[state].total / FIVE_MINS;
//     stats[state].lastMinute.mean = stats[state].total / MINUTE;
// });

// const xMean = (historyLength * (historyLength + 1)) / 2;
// const xMean30 = (HALF_HOUR * (HALF_HOUR + 1)) / 2;
// const xMean5Min = (FIVE_MINS * (FIVE_MINS + 1)) / 2;
// const xMeanMinute = (MINUTE * (MINUTE + 1)) / 2;

// for (let i = 0; i < historyLength; i++) {
//     const info = this.queueInfo.history[i];

//     Object.entries(info).forEach(([state, count], x) => {
//         const X = x + 1;
//         const getRise = (xmean, ymean) => (X - xmean) * (count - ymean);
//         const getRun = xmean => (X - xmean) * (X - xmean);

//         stats[state].rise += getRise(xMean, stats[state].mean);
//         stats[state].run += getRun(xMean);

//         if (i > historyLength - HALF_HOUR) {
//             stats[state].last30Min.rise += getRise(xMean30, stats[state].last30Min.mean);
//             stats[state].last30Min.run += getRun(xMean30);
//         }
//         if (i > historyLength - FIVE_MINS) {
//             stats[state].last5Min.rise += getRise(xMean5Min, stats[state].last5Min.mean);
//             stats[state].last5Min.run += getRun(xMean5Min);
//         }
//         if (i > historyLength - MINUTE) {
//             stats[state].lastMinute.rise += getRise(xMeanMinute, stats[state].lastMinute.mean);
//             stats[state].lastMinute.run += getRun(xMeanMinute);
//         }
//     });
// }

// const roundFloat = (num: number, precision = 5) => Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);

// Object.keys(stats).forEach(state => {
//     stats[state].slope = stats[state].rise / (stats[state].run || 1);
//     stats[state].intercept = stats[state].mean - stats[state].slope * xMean;

//     stats[state].last30Min.slope = stats[state].last30Min.rise / (stats[state].last30Min.run || 1);
//     stats[state].last30Min.intercept = stats[state].last30Min.mean - stats[state].last30Min.slope * xMean30;

//     stats[state].last5Min.slope = stats[state].last5Min.rise / (stats[state].last5Min.run || 1);
//     stats[state].last5Min.intercept = stats[state].last5Min.mean - stats[state].last5Min.slope * xMean5Min;

//     stats[state].lastMinute.slope = stats[state].lastMinute.rise / (stats[state].lastMinute.run || 1);
//     stats[state].lastMinute.intercept = stats[state].lastMinute.mean - stats[state].lastMinute.slope * xMeanMinute;

//     this.queueInfo.rates[state] = {
//         rate: roundFloat(stats[state].slope),
//         y: roundFloat(stats[state].intercept),
//         last30Min: {
//             rate: roundFloat(stats[state].last30Min.slope),
//             y: roundFloat(stats[state].last30Min.intercept),
//         },
//         last5Min: {
//             rate: roundFloat(stats[state].last5Min.slope),
//             y: roundFloat(stats[state].last5Min.intercept),
//         },
//         lastMinute: {
//             rate: roundFloat(stats[state].lastMinute.slope),
//             y: roundFloat(stats[state].lastMinute.intercept),
//         },
//     };
// });
