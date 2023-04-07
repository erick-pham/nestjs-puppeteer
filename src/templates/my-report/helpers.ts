export const getMessage = (
  array = [],
  cond: string,
  preHappiU: number,
  postHappiU: number
) => {
  const items = [];
  let rs = '';

  const huText = getHappiUText(preHappiU, postHappiU, true);
  array?.forEach((i) => {
    if (i.type.toUpperCase() === cond.toUpperCase()) {
      items.push(i);
    }
  });

  if (items.length === 0 && cond.toUpperCase() === 'Assess'.toUpperCase()) {
    items.push({
      type: 'Assess',
      insightMessage:
        'Unfortunately, we do not have any information to report here. Please speak to your advisor to learn more about what your HappiU is.'
    });
  }

  if (items.length === 0 && cond.toUpperCase() === 'Explain'.toUpperCase()) {
    items.push({
      type: 'Explain',
      insightMessage: `Unfortunately, we do not have any information to report here. Please speak to your advisor to learn more about why your HappiU is ${huText}.`
    });
  }

  if (items.length === 0 && cond.toUpperCase() === 'Recommend'.toUpperCase()) {
    items.push({
      type: 'Recommend',
      insightMessage:
        'Unfortunately, we do not have any information to report here. Please speak to your advisor to learn more about what you can do to increase your HappiU.'
    });
  }

  if (items.length === 1) {
    rs = `<div class="row-wrap text-normal" style="display:flex;">
      ${items[0].insightMessage}
      </div>`;
  } else {
    rs += `<ul>`;
    items.forEach((i) => {
      if (i.type.toUpperCase() === cond.toUpperCase()) {
        rs += `<li class="row-wrap text-normal">${i.insightMessage}</li>`;
      }
    });
    rs += `</ul>`;
  }
  return rs;
};

export const getScore = (preHappiU: number, postHappiU: number) => {
  let score = preHappiU;
  if (postHappiU > 0) {
    score = postHappiU;
  }
  return score;
};

export const getHappiUText = (
  preHappiU: number,
  postHappiU: number,
  textOnly: boolean
) => {
  let score = preHappiU;
  if (postHappiU > 0) {
    score = postHappiU;
  }

  if (textOnly === true) {
    if (Number(score) < 50) {
      return 'poor';
    } else if (Number(score) > 75) {
      return 'good';
    }
    return 'fair';
  }

  if (Number(score) < 50) {
    return "<span class='status' style='color: rgb(255, 23, 33);'><i>poor</i></span>";
  } else if (Number(score) > 75) {
    return "<span class='status' style='color: rgb(0, 201, 135);'><i>good</i></span>";
  }

  return "<span class='status' style='color: rgb(254, 198, 45)'><i>fair</i></span>";
};
