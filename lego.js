'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

var PRIORITY_LIST = ['format', 'limit', 'select', 'sortBy', 'and', 'or', 'filterIn'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var copiedCollection = copyCollection(collection);
    var allArguments = [].slice.call(arguments);
    var queries = allArguments.slice(1);
    console.info(queries);

    return queries
        .sort(sortByPriority)
        .reduce(function (param, quer) {
            return quer(param);
        }, copiedCollection);
};

function sortByPriority(firstFunction, secondFunction) {
    var index1 = PRIORITY_LIST.indexOf(firstFunction.name);
    var index2 = PRIORITY_LIST.indexOf(secondFunction.name);
    if (index1 === index2) {
        return 0;
    }

    return (index1 > index2) ? -1 : 1;
}

function copyCollection(collection) {
    var copiedCollection = [];
    collection.forEach(function (element) {
        var copiedElement = Object.assign({}, element);
        copiedCollection[copiedCollection.length] = copiedElement;
    });

    return copiedCollection;
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Array}
 */
exports.select = function () {
    var necessaryFields = [].slice.call(arguments);

    return function select(collection) {
        var selectedCollection = [];
        collection.forEach(function (note) {
            var allFields = Object.keys(note);
            var filteredNote = {};
            allFields.forEach(function (field) {
                if (necessaryFields.indexOf(field) !== -1) {
                    filteredNote[field] = note[field];
                }
            });

            selectedCollection[selectedCollection.length] = filteredNote;
        });
        console.info(selectedCollection);

        return selectedCollection;
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
        var filteredCollection = [];
        collection.forEach(function (note) {
            if (values.indexOf(note[property]) !== -1) {
                filteredCollection[filteredCollection.length] = note;
            }
        });

        return filteredCollection;
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
        console.info(sortedCollection);
        console.info('***');

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
        var newCollection = [];
        collection.forEach(function (element) {
            var newElement = Object.assign({}, element);
            newElement[property] = formatter(element[property]);
            newCollection[newCollection.length] = newElement;
        });
        console.info(newCollection);

        return newCollection;
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function (count) {
    console.info(count);

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
        console.info(functions);

        return function or(collection) {
            var copy = copyCollection(collection);
            var filteredCollection = copy.filter(function (note) {
                return functions.some(function (filterFunction) {
                    var result = filterFunction(copy);

                    return (result.indexOf(note) !== -1);
                });
            });

            console.info(filteredCollection);
            console.info('********');

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
            return functions.reduce(function (friends, filterFunction) {
                return filterFunction(friends);

            }, collection);
        };
    };
}
