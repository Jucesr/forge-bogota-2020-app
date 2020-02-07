export const formatDate = raw => {
  if(!raw) {
    return '';
  }
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(raw).toLocaleDateString('ES-es', options)
}

export const replaceAll = (text, search, replacement) => {
  text = text.replace(new RegExp(search, 'g'), replacement);
  return text;
};

export const generateOptions = (arrayOfOptions => {
  return arrayOfOptions.map(option => ({
    label: option,
    value: replaceAll(option, ' ', '_').toLowerCase()
  }))
})

export const objectToArray = (obj) => {
  if(!obj)
    return []

  return Object.keys(obj).map(key => obj[key])
}

export const formatColumn = (format, value) => {

  const type = typeof format === 'string' ? format : format.type;
  const decimals = typeof format === 'string' ? 2 : format.decimals;

  const transform = function (org, n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
      num = org.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  };

  switch (type) {
    case 'currency':
      if(isNaN(value))
        value = 0;
    return `$${transform(parseFloat(value), decimals, 3, ',', '.')}`;


    case 'number':
      if(isNaN(value))
        value = 0;
      return `${transform(parseFloat(value), decimals, 3, ',', '.')}`;

    case 'percentage':
      if(isNaN(value))
        value = 0;
    return `${transform(parseFloat(value), decimals, 3, ',', '.')}%`;

    default:
      return value

  }
};

export const convertToArrayObject = (array) => {
  return array.reduce((current, item) => {
      current[item._id] = item;
      return current
  }, {})
};

export const convertArrayToObjectWithValue = (array, objectWithValues) => {
  return array.reduce((current, item) => {
      current[item._id] = {
          ...objectWithValues[item._id],
          ...item
      };
      return current
  }, {})
};

export const toUpper = text => text !== null ? text.toUpperCase() : text;

export const validate = value => {
  return !value || value.length === 0
    ? 'Obligatorio'
    : undefined;
};

export const validateMax = max => value => {
  if(!value || value.length === 0)
    return 'Obligatorio'
  if(parseFloat(value) > max)
    return `Valor maximo ${formatColumn("currency", max)}`
  if(parseFloat(value) <= 0)
    return 'No puede ser 0'
};

export const validateNegative = value => {
  if(!value || value.length === 0)
    return 'Obligatorio'
  if(parseFloat(value) < 0)
    return 'No puede ser 0'
};


export const isValidDate = (dateObject) => { return new Date(dateObject).toString() !== 'Invalid Date'; }

export const makeItFlat = (items, rowIndex, condition) => {
  return items.reduce((acum, subtask) => {

     subtask.rowIndex = rowIndex
     if (subtask.subtasks && subtask.subtasks.length > 0) {
        const children = makeItFlat(subtask.subtasks, rowIndex + 1, condition)

        if(condition && !condition(subtask)){
          return [
            ...acum,
            ...children
         ]
        }else{
          return [
            ...acum,
            subtask,
            ...children
         ]
        }
        
     } else {
      if(condition && !condition(subtask)){
        return acum
      }else{
        return [
          ...acum,
          subtask
       ]
      }
     }

  }, [])
}