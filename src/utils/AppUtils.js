import { forEach, isEmpty, isFunction } from "lodash";

/**
 * @callback RejectCallback
 * @param {any} reason - Should be called after successful code execution
 */

export default {
  ORIGINS: {
    STAGING: "https://f-app-staging.supabaseapp.com",
    PRODUCTION: "https://app.f-app.com",
  },

  getCurrentOrigin() {
    if (process.env.MODE === "capacitor") {
      return process.env.ENV_TYPE === "production"
        ? this.ORIGINS.PRODUCTION
        : this.ORIGINS.STAGING;
    }

    return window.location.origin;
  },

  /**
   * @param {PromiseSettledResult<Awaited<Promise<*>>>[]} results
   * @param {RejectCallback} [rejectCallback]
   */
  handleAllSettledRejections(results, rejectCallback = null) {
    if (!results || isEmpty(results)) {
      return;
    }

    forEach(results, (result) => {
      if (result.status === "rejected") {
        console.error(result.reason);

        if (isFunction(rejectCallback)) {
          rejectCallback(result.reason);
        }
      }
    });
  },

  /**
   * Calls Promise.allSettled({@link promises}) and automatically handle all their rejections
   * with {@link handleAllSettledRejections}
   *
   * @param {Promise[]} promises
   * @param {RejectCallback} [rejectCallback] in case of additional handling of rejections needed
   * @returns - result of Promise.allSettled({@link promises})
   */
  async allSettled(promises, rejectCallback = null) {
    const allSettledResults = await Promise.allSettled(promises);
    this.handleAllSettledRejections(allSettledResults, rejectCallback);
    return allSettledResults;
  },

  /**
   * Hash provided string with SHA-256 or SHA-1 algorithm
   *
   * @param {string} string
   * @param {'SHA-256' | 'SHA-1'} [algorithm='SHA-256']
   * @return {Promise<string>}
   */
  async hashString(string, algorithm = "SHA-256") {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest(algorithm, utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * Check if the given argument is a plain object (not an array, not a string, not null, etc.)
   *
   * @param {any} item - the item to check
   * @return {boolean} - true if the given argument is a plain object
   */
  isPlainObject(item) {
    return (
      typeof item === "object" &&
      !Array.isArray(item) &&
      !(item instanceof String) &&
      item !== null
    );
  },
};

export const userRoles = {
  ADMIN: "admin",
  USER: "user",
};

/**
 * Returns null if item is undefined
 *
 * @param {any} item
 * @return {null | any}
 */
export function undefinedToNull(item) {
  return item === undefined ? null : item;
}

/**
 * @param {string} email
 * @return {boolean} - true if the given argument is a valid email
 */
export function isValidEmail(email) {
  return /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
    email
  );
}

/**
 * Validate the mustache syntax. As per Mustache.js library will pass both `{{}}` and `{{{}}}`, cases like
 * `{{{}}`, `{{ }` or `{{ { }}` are considered errors
 *
 * @param {string} val - string to validate
 * @return {boolean} - returns the result of the validation
 */
export function mustacheValidator(val) {
  if (typeof val === "string") {
    const openMustaches = [...val.matchAll(/{{2,3}/g)];
    const closedMustaches = [...val.matchAll(/}{2,3}/g)];
    const correctBracesNumber = openMustaches.length === closedMustaches.length;
    if (!correctBracesNumber) {
      return false;
    }

    return !closedMustaches.some((close, pairIndex) => {
      const open = openMustaches[pairIndex];
      // closing tag should be after opening
      if (close.index < open.index) {
        return true;
      }

      // only match double opening with double closing and triple opening with triple closing
      if (close[0].length !== open[0].length) {
        return true;
      }

      // closing tag should be before next opening
      const isLast = pairIndex === closedMustaches.length - 1;
      if (!isLast && close.index > openMustaches[pairIndex + 1].index) {
        return true;
      }

      // no dangling `{` inside mustache
      const mustacheContent = val.substring(
        open.index + open[0].length,
        close.index
      );
      return mustacheContent.includes("{");
    });
  }
} // mustacheValidator()

/**
 * Return the initials of the client name
 *
 * @param {string} name
 * @returns {string}
 */
export function getClientInitials(name) {
  if (!name) {
    return "";
  }

  // Remove any special characters expect dots, hyphens and commas
  let cleanedName = name
    .toUpperCase()
    .replace(/[^A-Z0-9-,\s]/g, "")
    .replace(/\./g, "") // Remove any periods
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens

  const generationSuffix = [
    "II",
    "III",
    "THE SECOND",
    "THE THIRD",
    "JUNIOR",
    "JR",
    "SENIOR",
    "SR",
    "DR",
  ];

  // Remove any generation suffix from cleanedName
  const suffixRegex = new RegExp(`\\b(${generationSuffix.join("|")})\\b`, "g");
  cleanedName = cleanedName.replace(suffixRegex, "").trim();

  // Remove everything after the first comma including the comma
  const nameWithoutComma = cleanedName.split(",")[0];

  // Split name into an array of words and remove empty strings
  const words = nameWithoutComma.split(" ").filter(Boolean);
  const firstLetter = words[0] ? words[0][0] : "";

  const [, ...rest] = words;
  const secondLetter = rest.length > 0 ? rest[rest.length - 1][0] : "";

  return `${firstLetter}${secondLetter}`;
} // getClientInitials()
