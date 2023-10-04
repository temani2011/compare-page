/**
 * Простенькое склонение числительных
 *
 * @param {number} num - число, от котрого пляшем
 * @param {string[]} wordForms - массив словоформ
 * @param {number[]} defaultCases - варианты словоформ по-умолчанию, из которых подбираются значения
 * @returns {string}
 * @example
 * const pluralizedWord = pluralize(300, ['товар', 'товара', 'товаров'])
 *
 */

export default function pluralize(
    num: number,
    wordForms: string[],
    defaultCases = [2, 0, 1, 1, 1, 2]
):string {
    return num + ' ' + wordForms[
        num % 100 > 4 && num % 100 < 20
            ? 2
            : defaultCases[num % 10 < 5 ? num % 10 : 5]
    ]
}
