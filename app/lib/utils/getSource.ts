import REGIONS from '@/app/lib/constants/regions';

interface ParamsInterface {
  region?: string;
  municipality?: string;
  district?: string;
}

export const SOURCE = 'https://ru.wikivoyage.org/wiki/Культурное_наследие_России';

const getSource = ({ region, municipality, district }: ParamsInterface) => {
  if (!region) return SOURCE;
  return `${SOURCE}/${REGIONS[region as keyof typeof REGIONS]}/${municipality || district}`;
};

export default getSource;
