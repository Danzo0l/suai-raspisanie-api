"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeTable = exports.parseParams = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const dom_parser_1 = __importDefault(require("dom-parser"));
const parseParams = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const getHtml = (url) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(url);
        return cheerio_1.default.load(data);
    });
    let counter = -1;
    const data = {
        groups: [],
        prepods: [],
        corpuses: [],
        audits: [],
    };
    const params = [[], [], [], []];
    const $ = yield getHtml(url);
    const pageNumber = yield $('select option').map((i, x) => {
        $(x).attr('value');
        if (Number($(x).attr('value')) == -1) {
            counter++;
        }
        params[counter].push({
            value: Number($(x).attr('value')),
            name: $(x).text(),
        });
    });
    data.groups = params[0];
    data.prepods = params[1];
    data.corpuses = params[2];
    data.audits = params[3];
    return data;
});
exports.parseParams = parseParams;
const parseTimeTable = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const getHtml = (url) => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(url);
        return cheerio_1.default.load(data);
    });
    const timeTable = [];
    const $ = yield getHtml(url);
    const html = (_a = $('div.result')
        .html()) === null || _a === void 0 ? void 0 : _a.toString().split('<h3>').map((elem, index) => {
        // print day
        if (index > 0) {
            // console.log('!', elem.split('</h3>')[0], '!');
            const day = {
                day: elem.split('</h3>')[0],
                lessons: [],
            };
            elem
                .split('</h3>')[1]
                .split('<h4>')
                .map((sub, index1) => {
                var _a;
                if (index1 > 0) {
                    // console.log('|', sub.split('</h4>')[0], '|');
                    const parap = [];
                    const countLesson = sub.split('</h4>')[0];
                    const parser = new dom_parser_1.default();
                    let arrayOfLesson = [];
                    (_a = parser
                        .parseFromString(sub.split('</h4>')[1])
                        .getElementsByClassName('study')) === null || _a === void 0 ? void 0 : _a.map((node) => {
                        let arrayOf = [];
                        node.childNodes.forEach((subNode) => {
                            var _a;
                            (_a = subNode.getElementsByTagName('b')) === null || _a === void 0 ? void 0 : _a.map((bElem) => {
                                // console.log(bElem.innerHTML);
                            });
                            const study = subNode.textContent.split(' – ');
                            // console.log('>>', study);
                            arrayOf.push(study);
                        });
                        arrayOfLesson.push(arrayOf);
                    });
                    for (let i in arrayOfLesson) {
                        let count;
                        let time;
                        let type;
                        let prepod;
                        let location;
                        let period;
                        if (countLesson.split('пара').length > 1) {
                            count = countLesson.split('пара')[0].replace(' ', '');
                            time = countLesson.split('пара')[1].replace(' ', '');
                        }
                        else {
                            count = countLesson;
                            time = '';
                        }
                        if (arrayOfLesson[i][0][0].split(' ').length > 1) {
                            type = arrayOfLesson[i][0][0].split(' ')[1];
                            if (arrayOfLesson[i][0][0].split(' ')[0] == '▼') {
                                period = 'low';
                            }
                            else if (arrayOfLesson[i][0][0].split(' ')[0] == '▲') {
                                period = 'up';
                            }
                            else {
                                period = 'all';
                            }
                        }
                        else {
                            type = arrayOfLesson[i][0][0];
                            period = 'all';
                        }
                        if (arrayOfLesson[i][1][0].split('реподават').length > 1) {
                            prepod = arrayOfLesson[i][1][0].split('Групп')[0].split(': ')[1];
                        }
                        else {
                            prepod = '';
                        }
                        location = arrayOfLesson[i][0][2];
                        const lesson = {
                            count: count,
                            time: time,
                            name: arrayOfLesson[i][0][1],
                            type: type,
                            prepod: prepod,
                            location: location,
                            period: period,
                        };
                        parap.push(lesson);
                        // console.log(lesson);
                        // console.log(arrayOfLesson[i]);
                    }
                    day.lessons.push(parap);
                }
            });
            timeTable.push(day);
        }
    });
    return timeTable;
});
exports.parseTimeTable = parseTimeTable;
