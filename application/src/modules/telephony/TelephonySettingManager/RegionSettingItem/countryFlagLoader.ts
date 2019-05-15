import AR from 'jui/assets/country-flag/Argentina.svg';
import AU from 'jui/assets/country-flag/Australia.svg';
import AT from 'jui/assets/country-flag/Austria.svg';
import BE from 'jui/assets/country-flag/Belgium.svg';
import BR from 'jui/assets/country-flag/Brazil.svg';
import CA from 'jui/assets/country-flag/Canada.svg';
import CL from 'jui/assets/country-flag/Chile.svg';
import CN from 'jui/assets/country-flag/China.svg';
import CO from 'jui/assets/country-flag/Colombia.svg';
import CR from 'jui/assets/country-flag/Costa Rica.svg';
import HR from 'jui/assets/country-flag/Croatia.svg';
import CZ from 'jui/assets/country-flag/Czech Republic.svg';
import DK from 'jui/assets/country-flag/Denmark.svg';
import FI from 'jui/assets/country-flag/Finland.svg';
import FR from 'jui/assets/country-flag/France.svg';
import DE from 'jui/assets/country-flag/Germany.svg';
import HK from 'jui/assets/country-flag/Hong Kong.svg';
import HU from 'jui/assets/country-flag/Hungary.svg';
import IN from 'jui/assets/country-flag/India.svg';
import IE from 'jui/assets/country-flag/Ireland.svg';
import IL from 'jui/assets/country-flag/Israel.svg';
import IT from 'jui/assets/country-flag/Italy.svg';
import JP from 'jui/assets/country-flag/Japan.svg';
import LU from 'jui/assets/country-flag/Luxembourg.svg';
import MY from 'jui/assets/country-flag/Malaysia.svg';
import MX from 'jui/assets/country-flag/Mexico.svg';
import NL from 'jui/assets/country-flag/Netherlands.svg';
import NZ from 'jui/assets/country-flag/New Zealand.svg';
import NO from 'jui/assets/country-flag/Norway.svg';
import PE from 'jui/assets/country-flag/Peru.svg';
import PH from 'jui/assets/country-flag/Philippines.svg';
import PL from 'jui/assets/country-flag/Poland.svg';
import PT from 'jui/assets/country-flag/Portugal.svg';
import RO from 'jui/assets/country-flag/Romania.svg';
import SG from 'jui/assets/country-flag/Singapore.svg';
import SK from 'jui/assets/country-flag/Slovakia.svg';
import ZA from 'jui/assets/country-flag/South Africa.svg';
import KR from 'jui/assets/country-flag/South Korea.svg';
import ES from 'jui/assets/country-flag/Spain.svg';
import SE from 'jui/assets/country-flag/Sweden.svg';
import CH from 'jui/assets/country-flag/Switzerland.svg';
import TW from 'jui/assets/country-flag/Taiwan.svg';
import GB from 'jui/assets/country-flag/United Kingdom.svg';
import US from 'jui/assets/country-flag/United States.svg';

const getCountryFlag = (isoCode: string) => {
  const flags = {
    AR,
    AU,
    AT,
    BE,
    BR,
    CA,
    CL,
    CN,
    CO,
    CR,
    HR,
    CZ,
    DK,
    FI,
    FR,
    DE,
    HK,
    HU,
    IN,
    IE,
    IL,
    IT,
    JP,
    LU,
    MY,
    MX,
    NL,
    NZ,
    NO,
    PE,
    PH,
    PL,
    PT,
    RO,
    SG,
    SK,
    ZA,
    KR,
    ES,
    SE,
    CH,
    TW,
    GB,
    US,
  };

  return flags[isoCode];
};

export { getCountryFlag };
