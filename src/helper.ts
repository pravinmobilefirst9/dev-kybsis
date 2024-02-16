export function isFutureDate(dateString : string) {
    const currentDate = new Date(); // Current date and time
    const inputDate = new Date(dateString); // Date parsed from the input string
    
    // Compare the input date with the current date
    return inputDate.getMilliseconds() > currentDate.getMilliseconds();
  }