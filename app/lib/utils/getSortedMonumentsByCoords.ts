import MonumentInterface from '@/app/lib/interfaces/Monument';

interface AccInterface {
  [key: string]: MonumentInterface[];
}

const getSortedMonumentsByCoords = (monuments: MonumentInterface[]): MonumentInterface[][] => {
  const sortedMonuments = monuments.reduce((acc: AccInterface, monument: MonumentInterface) => {
    const key = `${monument.lat}_${monument.lon}`;

    if (acc[key]) {
      return { ...acc, [key]: acc[key].concat(monument) };
    }

    return { ...acc, [key]: [monument] };
  }, {});

  return Object.keys(sortedMonuments).map((key) => sortedMonuments[key]);
};

export default getSortedMonumentsByCoords;
