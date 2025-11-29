export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  export const formatFootprint = (footprint: number): string => {
    return `${formatNumber(Math.round(footprint))} kg CO₂`;
  };