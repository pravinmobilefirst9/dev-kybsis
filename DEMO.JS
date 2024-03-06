function calculateInvestmentDetails(principal, annualInterestRate, years, contribution, contributionFrequency, compoundingFrequency) {
    // Constants
    const compoundingPerYear = {
        annually: 1,
        semiannually: 2,
        quarterly: 4,
        monthly: 12,
        biweekly: 26,
        weekly: 52,
        daily: 365,
        continuously: 'continuously'
    };

    const contributionsPerYear = {
        endOfYear: 1,
        endOfMonth: 12,
        startOfYear: 1,
        startOfMonth: 12
    };

    // Calculate compounding periods and contribution periods per year
    const n = compoundingPerYear[compoundingFrequency];
    const m = contributionsPerYear[contributionFrequency];

    // Initialize future value of the lump sum and annuity
    let FV_lumpSum = principal;
    let FV_annuity = 0;

    if (compoundingFrequency === 'continuously') {
        FV_lumpSum = principal * Math.exp(annualInterestRate * years);
    } else {
        // Calculate future value of the lump sum
        FV_lumpSum *= Math.pow(1 + annualInterestRate / n, n * years);
    }

    // Calculate future value of the annuity
    for (let i = 1; i <= years * m; i++) {
        let contributionTime = i / m;
        if (contributionFrequency.includes('end')) {
            contributionTime -= 1 / m;
        }
        
        if (compoundingFrequency === 'continuously') {
            FV_annuity += contribution * Math.exp(annualInterestRate * contributionTime);
        } else {
            FV_annuity += contribution * Math.pow(1 + annualInterestRate / n, n * contributionTime);
        }
    }

    // Calculate total future value
    const totalFV = FV_lumpSum + FV_annuity;

    // Calculate total contributions
    const totalContributions = principal + contribution * years * m;

    // Calculate total interest earned
    const totalInterest = totalFV - totalContributions;

    return {
        futureValue: totalFV.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalContributions: totalContributions.toFixed(2)
    };
}

// Example usage:
// const investmentDetails = calculateInvestmentDetails(1000, -0.03, 2, 100, 'startOfMonth', 'annually');
// console.log(investmentDetails);


let currentMonth = new Date();
currentMonth = currentMonth.setDate(1)
console.log(currentMonth.getMonth());