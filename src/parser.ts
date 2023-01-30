import axios from 'axios';
import cheerio from 'cheerio';
import DomParser from 'dom-parser';

interface OneParam {
  value: number;
  name: string;
}

interface SortProperties {
  groups: Array<OneParam>;
  prepods: Array<OneParam>;
  corpuses: Array<OneParam>;
  audits: Array<OneParam>;
}

interface Lesson {
  count: string;
  time: string;
  name: string;
  type: string;
  prepod: string;
  location: string;
  period: string;
}

type Para = Array<Lesson>;

interface Day {
  day: string;
  lessons: Array<Para>;
}

type TimeTable = Array<Day>;

export const parseParams = async (url: string) => {
  const getHtml = async (url: string) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
  };

  let counter = -1;

  const data: SortProperties = {
    groups: [],
    prepods: [],
    corpuses: [],
    audits: [],
  };

  const params: Array<Array<OneParam>> = [[], [], [], []];

  const $ = await getHtml(url);
  const pageNumber = await $('select option').map((i, x) => {
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
};

export const parseTimeTable = async (url: string) => {
  const getHtml = async (url: string) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
  };

  const timeTable: TimeTable = [];

  const $ = await getHtml(url);
  const html = $('div.result')
    .html()
    ?.toString()
    .split('<h3>')
    .map((elem, index) => {
      // print day
      if (index > 0) {
        // console.log('!', elem.split('</h3>')[0], '!');
        const day: Day = {
          day: elem.split('</h3>')[0],
          lessons: [],
        };
        elem
          .split('</h3>')[1]
          .split('<h4>')
          .map((sub, index1) => {
            if (index1 > 0) {
              // console.log('|', sub.split('</h4>')[0], '|');
              const parap: Para = [];
              const countLesson = sub.split('</h4>')[0];
              const parser = new DomParser();
              let arrayOfLesson: any = [];
              parser
                .parseFromString(sub.split('</h4>')[1])
                .getElementsByClassName('study')
                ?.map((node) => {
                  let arrayOf: any = [];
                  node.childNodes.forEach((subNode) => {
                    subNode.getElementsByTagName('b')?.map((bElem) => {
                      // console.log(bElem.innerHTML);
                    });
                    const study = subNode.textContent.split(' – ');
                    // console.log('>>', study);
                    arrayOf.push(study);
                  });
                  arrayOfLesson.push(arrayOf);
                });

              for (let i in arrayOfLesson) {
                let count: string;
                let time: string;
                let type: string;
                let prepod: string;
                let location: string;
                let period: string;

                if (countLesson.split('пара').length > 1) {
                  count = countLesson.split('пара')[0].replace(' ', '');
                  time = countLesson.split('пара')[1].replace(' ', '');
                } else {
                  count = countLesson;
                  time = '';
                }

                if (arrayOfLesson[i][0][0].split(' ').length > 1) {
                  type = arrayOfLesson[i][0][0].split(' ')[1];
                  if (arrayOfLesson[i][0][0].split(' ')[0] == '▼') {
                    period = 'low';
                  } else if (arrayOfLesson[i][0][0].split(' ')[0] == '▲') {
                    period = 'up';
                  } else {
                    period = 'all';
                  }
                } else {
                  type = arrayOfLesson[i][0][0];
                  period = 'all';
                }

                if (arrayOfLesson[i][1][0].split('реподават').length > 1) {
                  prepod = arrayOfLesson[i][1][0].split('Групп')[0].split(': ')[1];
                } else {
                  prepod = '';
                }

                location = arrayOfLesson[i][0][2];

                const lesson: Lesson = {
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
};
