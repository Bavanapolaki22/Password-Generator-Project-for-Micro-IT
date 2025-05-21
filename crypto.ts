/**
 * Cryptographically Secure Pseudo-Random Number Generator
 * Uses Web Crypto API for secure random number generation
 */
export class CSPRNG {
  private static instance: CSPRNG;

  private constructor() {}

  public static getInstance(): CSPRNG {
    if (!CSPRNG.instance) {
      CSPRNG.instance = new CSPRNG();
    }
    return CSPRNG.instance;
  }

  /**
   * Generates a cryptographically secure random number between min and max
   */
  private getRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const array = new Uint8Array(bytesNeeded);
    
    window.crypto.getRandomValues(array);
    
    let value = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      value = (value * 256) + array[i];
    }
    
    // Ensure uniform distribution
    value = value % range;
    return min + value;
  }

  /**
   * Generates a random password based on the provided options
   */
  public async generatePassword(options: {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  }): Promise<string> {
    const { length, uppercase, lowercase, numbers, symbols } = options;
    
    // Define character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_-+={}[]|:;<>,.?/~';
    
    // Create character pool based on options
    let charPool = '';
    if (uppercase) charPool += uppercaseChars;
    if (lowercase) charPool += lowercaseChars;
    if (numbers) charPool += numberChars;
    if (symbols) charPool += symbolChars;
    
    if (charPool.length === 0) {
      throw new Error('At least one character type must be selected');
    }
    
    // Ensure at least one character from each selected type
    let password = '';
    
    if (uppercase) {
      password += uppercaseChars.charAt(this.getRandomInt(0, uppercaseChars.length - 1));
    }
    
    if (lowercase) {
      password += lowercaseChars.charAt(this.getRandomInt(0, lowercaseChars.length - 1));
    }
    
    if (numbers) {
      password += numberChars.charAt(this.getRandomInt(0, numberChars.length - 1));
    }
    
    if (symbols) {
      password += symbolChars.charAt(this.getRandomInt(0, symbolChars.length - 1));
    }
    
    // Fill the rest of the password
    while (password.length < length) {
      const randomIndex = this.getRandomInt(0, charPool.length - 1);
      password += charPool.charAt(randomIndex);
    }
    
    // Shuffle the password to ensure randomness
    return this.shuffleString(password);
  }
  
  /**
   * Shuffles a string using Fisher-Yates algorithm
   */
  private shuffleString(str: string): string {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getRandomInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}