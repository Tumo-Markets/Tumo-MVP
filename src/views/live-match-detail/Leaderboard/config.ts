import silverMedal from 'public/leaderboard/silver-medal.png';
import goldMedal from 'public/leaderboard/gold-medal.png';
import bronzeMedal from 'public/leaderboard/bronze-medal.png';

export const svgPaths = {
  peb4ef80:
    'M11.34 0.0493867C11.7271 -0.0981437 12.1604 0.0960252 12.308 0.483075L13.4861 3.57384C13.5994 3.87116 13.5128 4.20764 13.27 4.41328C13.0271 4.61893 12.681 4.64897 12.4064 4.48824C11.3336 3.86032 10.085 3.5002 8.75 3.5002C4.74594 3.5002 1.5 6.74614 1.5 10.7502C1.5 12.072 1.85304 13.309 2.46946 14.3747C2.67687 14.7332 2.55435 15.192 2.1958 15.3994C1.83726 15.6068 1.37846 15.4843 1.17105 15.1257C0.426117 13.838 0 12.3427 0 10.7502C0 5.91771 3.91751 2.0002 8.75 2.0002C9.6886 2.0002 10.5934 2.14822 11.4418 2.42229L10.9063 1.01733C10.7588 0.63028 10.953 0.196917 11.34 0.0493867ZM15.3042 6.101C15.6627 5.89359 16.1215 6.01611 16.3289 6.37466C17.0739 7.66243 17.5 9.15769 17.5 10.7502C17.5 15.5827 13.5825 19.5002 8.75 19.5002C7.8114 19.5002 6.90659 19.3522 6.05814 19.0781L6.59367 20.4831C6.7412 20.8701 6.54704 21.3035 6.15999 21.451C5.77294 21.5985 5.33958 21.4044 5.19204 21.0173L4.01392 17.9266C3.90058 17.6292 3.9872 17.2927 4.23001 17.0871C4.47282 16.8815 4.81897 16.8514 5.09358 17.0121C6.16641 17.6401 7.41501 18.0002 8.75 18.0002C12.7541 18.0002 16 14.7543 16 10.7502C16 9.42842 15.647 8.19136 15.0305 7.12575C14.8231 6.7672 14.9457 6.30841 15.3042 6.101Z',
};

export const MEDAL_CONFIG = {
  1: { image: goldMedal, alt: 'gold-medal' },
  2: { image: silverMedal, alt: 'silver-medal' },
  3: { image: bronzeMedal, alt: 'bronze-medal' },
} as const;

export const PODIUM_CONFIG = {
  1: {
    height: 'h-[129px]',
    bg: 'bg-[#2b2b2b]',
    rounded: 'rounded-tl-xl rounded-tr-xl',
    px: 'px-2.5',
    numberTop: 'top-[74px]',
    gradientTop: 'top-[93px]',
  },
  2: {
    height: 'h-[103px]',
    bg: 'bg-[#232222]',
    rounded: 'rounded-tr-xl',
    px: 'px-0',
    numberTop: 'top-12',
    gradientTop: 'top-[67px]',
  },
  3: {
    height: 'h-[82px]',
    bg: 'bg-[#1b1b1b]',
    rounded: 'rounded-tl-xl',
    px: 'px-0',
    numberTop: 'top-[27px]',
    gradientTop: 'top-[46px]',
  },
} as const;

export const INFO_POSITION = {
  1: 'bottom-[137px] left-1/2',
  2: 'bottom-[111px] left-[calc(50%+100px)]',
  3: 'bottom-[90px] left-[calc(50%-100px)]',
} as const;
