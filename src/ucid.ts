const minContextLen = 2
const maxContextLen = 8
const maxTimestamp = 0x0000_0FFF_FFFF_FFFF
const maxRandom = 0x000F_FFFF

const ucidParsePattern = /^([a-z]{2,8})_([0-9a-f]{4})_([0-9a-f]{4})_([0-9a-f]{3})([0-9a-f])_([0-9a-f]{4})$/

export class UCIDData {
    static fromUCID(ucid: string): UCIDData {
        const result = ucidParsePattern.exec(ucid)
        if (!result) {
            throw new Error('invalid ucid')
        }

        const context = result[1] as string
        const timestampString = (result[2] as string) + (result[3] as string) + (result[4] as string)
        const randomString = (result[5] as string) + (result[6] as string)

        const timestamp = parseInt(timestampString, 16)
        const random = parseInt(randomString, 16)

        const ucidData = new UCIDData(context)
        ucidData.timestamp = timestamp
        ucidData.random = random
        return ucidData
    }

    context: string
    timestamp: number
    random: number

    /**
     * The constructor generates a new UCID data structure using a given context.
     * The timestamp will be set to now and a random number will be generated.
     * The context should have at least 2 characters and have a maximum length of 8 characters.
     * It should consist only of small letters.
     */
    constructor(
        context: string,
    ) {
        this.context = context
        this.timestamp = new Date().getTime() % (maxTimestamp + 1)
        this.random = Math.floor(Math.random() * (maxRandom + 1))
    }

    public toUCID(): string {
        // Validate
        if (this.context.length < minContextLen) {
            throw new Error('context too short')
        }
        if (this.context.length > maxContextLen) {
            throw new Error('context too long')
        }
        for (const r of this.context) {
            if (r < 'a' || r > 'z') {
                throw new Error('only lower case letters allowed')
            }
        }
        if (this.timestamp < 0) {
            throw new Error('timestamp is negative')
        }
        if (this.timestamp > maxTimestamp) {
            throw new Error('timestamp is too high')
        }
        if (this.random < 0) {
            throw new Error('random is negative')
        }
        if (this.random > maxRandom) {
            throw new Error('random is too high')
        }

        // Generate string value
        const hexPart = this.timestamp.toString(16).padStart(11, '0') +
            this.random.toString(16).padStart(5, '0')

        return [
            this.context,
            hexPart.substring(0, 4),
            hexPart.substring(4, 8),
            hexPart.substring(8, 12),
            hexPart.substring(12, 16),
        ].join('_')
    }
}

/**
 * Generate a UCID string using a given context
 * The timestamp will be set to now and a random number will be generated.
 * The context should have at least 2 characters and have a maximum length of 8 characters.
 * It should consist only of small letters.
 *
 * @param context The context part for the UCID
 */
export function createUCID(context: string): string {
    return new UCIDData(context).toUCID()
}
