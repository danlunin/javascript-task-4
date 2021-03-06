'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITY_DICT = {
    format: 10,
    limit: 20,
    select: 30,
    sortBy: 40,
    filterIn: 50,
    and: 50,
    or: 50
};

function copyElement(element) {
    var copiedElement = {};
    Object.keys(element).forEach(function (field) {
        copiedElement[field] = element[field];
    });

    return copiedElement;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var copiedCollection = collection.slice();
    var queries = [].slice.call(arguments, 1);

    return queries
        .sort(sortByPriority)
        .reduce(function (parameter, currentFunction) {
            return currentFunction(parameter);
        }, copiedCollection);
};

function sortByPriority(firstFunction, secondFunction) {
    var index1 = PRIORITY_DICT[firstFunction.name];
    var index2 = PRIORITY_DICT[secondFunction.name];
    if (index1 === index2) {
        return 0;
    }

    return (index1 > index2) ? -1 : 1;
}


/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    var necessaryFields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (note) {
            var allFields = Object.keys(note);
            var filteredNote = {};
            allFields.forEach(function (field) {
                if (necessaryFields.indexOf(field) !== -1) {
                    filteredNote[field] = note[field];
                }
            });

            return filteredNote;
        });

    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Array}
 */
exports.filterIn = function (property, values) {
    console.info(property, values);

    return function filterIn(collection) {
        return collection.filter(function (note) {
            return values.indexOf(note[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Array}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        var sortedCollection = collection.sort(function (first, second) {
            if (first[property] === second[property]) {
                return 0;
            }
            var orderSign = order === 'asc' ? 1 : -1;
            var resultOfComparing = (first[property] > second[property]) ? 1 : -1;

            return resultOfComparing * orderSign;
        });

        return sortedCollection;
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    console.info(property, formatter);

    return function format(collection) {
        return collection.map(function (element) {
            var newElement = copyElement(element);
            newElement[property] = formatter(element[property]);

            return newElement;
        });
    };
};


/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.or = function () {
        var functions = [].slice.call(arguments);

        return function or(collection) {
            var copy = collection.slice();
            var filteredCollection = copy.filter(function (note) {
                return functions.some(function (filterFunction) {
                    var result = filterFunction(copy);

                    return (result.indexOf(note) !== -1);
                });
            });

            return filteredCollection;
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @Return {Array}
     */
    exports.and = function () {
        var functions = [].slice.call(arguments);

        return function and(collection) {
            var copy = collection.slice();

            return copy.filter(function (note) {
                return functions.every(function (filterFunction) {
                    return filterFunction(copy).indexOf(note) !== -1;
                });
            });
        };
    };
}

