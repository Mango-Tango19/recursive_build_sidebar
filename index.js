
const article = document.querySelector(".entry-content1");

const headers = {
  headersH2: [...article.querySelectorAll("h2")],
  headersH3: [...article.querySelectorAll("h3")],
  headersH4: [...article.querySelectorAll("h4")],
  headersH5: [...article.querySelectorAll("h5")],
  headersH6: [...article.querySelectorAll("h6")],
};

const anchorClasses = {
  H2: "anchor-h2",
  H3: "anchor-h3",
  H4: "anchor-h4",
  H5: "anchor-h5",
  H6: "anchor-h6",
};

function addAnchors(headersArray) {
  let tag = headersArray[0].tagName;
  headersArray.forEach((header, index) => {
    header.classList.add("anchor");
    header.id = `${anchorClasses[tag]}-${index}`;
  });
}

//set anchors to all headers and get coordinates

Object.values(headers).forEach((headersArray) => {
  if (headersArray.length) {
    addAnchors(headersArray);
  }
});

const headersByOrder = [
  ...document.querySelectorAll(
    ".entry-content1 > h2, .entry-content1 > h3, .entry-content1 > h4, .entry-content1 > h5, .entry-content1 > h6"
  ),
];

let headerByAnchors = {};

for (key in headersByOrder) {
  headerByAnchors[headersByOrder[key].id] = {
    coord: [],
    elem: headersByOrder[key],
  };
}

/// add coordinates to all headers to headerByAnchors
function addCoordinates(headersByOrder) {
  let arr = [...headersByOrder];
  arr.forEach((elem) => {
    let top = elem.getBoundingClientRect().top;
    headerByAnchors[elem.id].coord = top;
  });
}

addCoordinates(headersByOrder);

let structure = {};

let resultStructure = recursive(structure, headersByOrder);

function recursive(structure, headersByOrder, index = 0) {
  let currentElement = headersByOrder[index];
  structure[index] = {
    selfIndex: index,
    tagName: headersByOrder[index].tagName,
  };
  if (index < headersByOrder.length - 1) {
    let hasChild = ifnextElementChild(
      currentElement.tagName,
      headersByOrder[index + 1].tagName
    );
    if (hasChild) {
      let parentIndex = searchParentIndex(index, index - 1, headersByOrder);
      structure[index].childIndex = index + 1;
      structure[index].parentIndex = parentIndex;

      recursive(structure, headersByOrder, index + 1);
    } else {
      let parentIndex = index;
      if (index > 0) {
        parentIndex = searchParentIndex(index, index - 1, headersByOrder);
        structure[index].parentIndex = parentIndex;
      }
      recursive(structure, headersByOrder, index + 1);
    }
  }
  if (index === 0) {
    let parentIndex = index;
    structure[index].parentIndex = parentIndex;
    return structure;
  }
  let parentIndex = searchParentIndex(index, index - 1, headersByOrder);
  structure[index].parentIndex = parentIndex;
  return structure;
}

function searchParentIndex(currentIndex, prevIndex, headersByOrder) {
  if (currentIndex <= 0) {
    return prevIndex;
  }
  let currentTag = +headersByOrder[currentIndex].tagName.slice(1);
  let prevTag = +headersByOrder[prevIndex].tagName.slice(1);

  if (prevTag == currentTag) {
    if (prevTag == 2) {
      return currentIndex;
    }

    searchParentIndex(currentIndex, prevIndex - 1, headersByOrder);
  }
  if (prevTag < currentTag) {
    return prevIndex;
  }

  return searchParentIndex(currentIndex, prevIndex - 1, headersByOrder);
}

function ifnextElementChild(currentTagName, nextTagName) {
  let current = +currentTagName.slice(1);
  let next = +nextTagName.slice(1);

  return next > current;
}



let sidebarList = document.createElement("ol");

const getParentIndex = function (index) {
  return resultStructure[resultStructure[index].parentIndex].selfIndex;
};

const getContainerName = function (parentIndex) {
  return `menu-${resultStructure[parentIndex].tagName}-${resultStructure[parentIndex].selfIndex}`;
};

const setLiClassName = function (index) {
  return `menu-${resultStructure[index].tagName}-${resultStructure[index].selfIndex}`;
};


const createListItem = function (index, li) {
  let a = document.createElement("a");
  a.setAttribute('data-target', `${headersByOrder[index].id}`);
  a.innerText = `${headersByOrder[index].innerText}`
  li.append(a);
};

let listStructure = createListRecursive(resultStructure, sidebarList);

const customSideBar = document.querySelector(".custom-sidebar");
customSideBar.append(listStructure);

function createListRecursive(
  resultStructure,
  sidebarList,
  containerName = "",
  index = 0
) {
  if (index == Object.keys(resultStructure).length - 1) {
    if (resultStructure[index].tagName !== "H2") {
      let parentIndex = getParentIndex(index);
      let li = document.createElement("li");
      createListItem(index, li);
      li.classList.add(setLiClassName(index));
      containerName = getContainerName(parentIndex);
      //append new li to container
      sidebarList.querySelector(`ol.${containerName}`).append(li);
      return sidebarList;
    } else {
      let li = document.createElement("li");
      createListItem(index, li);
      let liClassName = setLiClassName(index);
      li.classList.add(liClassName);
      sidebarList.append(li);
      return sidebarList;
    }

    return sidebarList;
  } else {
    if (resultStructure[index].tagName !== "H2") {
      //search parent
      let parentIndex = getParentIndex(index);
      //create new item and set class
      let li = document.createElement("li");
      createListItem(index, li);
      li.classList.add(setLiClassName(index));
      //search container
      containerName = getContainerName(parentIndex);
      //append new li to container
      sidebarList.querySelector(`ol.${containerName}`).append(li);
      containerName = setLiClassName(index);
    } else {
      let li = document.createElement("li");
      createListItem(index, li);
      let liClassName = setLiClassName(index);
      li.classList.add(liClassName);
      sidebarList.append(li);
    }

    if (containerName == "") {
      if (resultStructure[index].tagName !== "H2") {
        let li = document.createElement("li");
        createListItem(index, li);
        li.classList.add(setLiClassName(index));
        let parentIndex = resultStructure[index].parentIndex;
        let parentSelector = getParentIndex(parentIndex); 
        sidebarList.querySelector(`.${parentSelector}`).append(li);
        if (resultStructure[index].childIndex !== undefined) {
          let container = document.createElement("ol");
          containerName = `menu-${resultStructure[index].tagName}-${index}`;
          container.classList.add(containerName);
          li.append(container);
          return createListRecursive(
            resultStructure,
            sidebarList,
            containerName,
            resultStructure[index].childIndex
          );
        } else {
          return createListRecursive(
            resultStructure,
            sidebarList,
            containerName,
            index + 1
          );
        }
      }

      if (resultStructure[index].childIndex !== undefined) {
        let container = document.createElement("ol");
        containerName = `menu-${resultStructure[index].tagName}-${index}`;
        container.classList.add(containerName);
        let li = sidebarList.querySelector(
          `.menu-${resultStructure[index].tagName}-${resultStructure[index].selfIndex}`
        );
        li.append(container);
        return createListRecursive(
          resultStructure,
          sidebarList,
          containerName,
          resultStructure[index].childIndex
        );
      }
      return createListRecursive(
        resultStructure,
        sidebarList,
        containerName,
        index + 1
      );
    } else {
      if (resultStructure[index].childIndex !== undefined) {
        let li = sidebarList.querySelector(`li.${containerName}`);
        let ul = document.createElement("ol");
        ul.classList.add(containerName);
        li.append(ul);
        return createListRecursive(
          resultStructure,
          sidebarList,
          containerName,
          resultStructure[index].childIndex
        );
      }
      return createListRecursive(
        resultStructure,
        sidebarList,
        (containerName = ""),
        index + 1
      );
    }
  }

  return sidebarList;
}

function giveSubMenuClass() {
  let lists = customSideBar.querySelectorAll('li[class^="menu-H2"]');
  lists.forEach((list) => {
    if (list.childNodes.length > 1) {
      list.classList.add("has-sub-menu");
    }
  });
}
giveSubMenuClass();

let liWithSubmenu = [...customSideBar.querySelectorAll("has-sub-menu")];

//scroll window following sidebar

function smothScroll(target) {

  let targetEl = article.querySelector(`#${target}`);
  targetEl.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}


//add click to link
let links = customSideBar.querySelectorAll("a");

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    let target = e.target.dataset.target;
    smothScroll(target);
  });
});

$(document).ready(function () {
  $(window).on("scroll", events);
//lighting menu items
  function lightingMenu() {
    $(".anchor").each(function () {
      if ($(window).scrollTop() >= $(this).offset().top - 80) {
        let id = $(this).attr("id");
        $(".custom-sidebar a").removeClass("active");
        $(`.custom-sidebar a[data-target="${id}"]`).addClass("active");
        $(`.entry-content1 #${id}`).removeClass("active");
        $(`.entry-content1 #${id}`).addClass("active");
        addClassForSec(id);
        clearTimeout(addClassForSec);
      }
    });

    if ($(window).scrollTop() == 0) {
      $(".custom-sidebar a").each(function() {
        $(".custom-sidebar a").removeClass("active")
      });
    }
  }
  //events on scroll
  function events() {
    moveSideBar();
    lightingMenu();
  }

  //show sub-menu

  // $('.custom-sidebar li.has-sub-menu').each(function() {
  //   $(this).mousemove(function() {
  //     $('.custom-sidebar li.has-sub-menu ol').addClass('show');
  //   })
    
  // })

  ///get child class





function addClassForSec(id) {
  setTimeout(function () {
    $(`.entry-content1 #${id}`).removeClass("active");
  }, 2000);
}
})

function makeEaseOut(timing) {
  return function (timeFraction) {
    return 1 - timing(1 - timeFraction);
  };
}

function quad(timeFraction) {
  return Math.pow(timeFraction, 2);
}

let screenHeight = window.screen.height;
//let sidebarHeight = customSideBar.clientHeight;
//let bottomEdge = article.getBoundingClientRect().bottom - sidebarHeight;
let topEdge = customSideBar.getBoundingClientRect().top + window.scrollY;


function moveSideBar() {

  if (window.pageYOffset > topEdge) {
    
    animate({
      duration: 2000,
      timing: makeEaseOut(quad),
      draw(progress) {
        let to = screenHeight / 2 + window.pageYOffset - customSideBar.clientHeight;
        
        if (to >= article.getBoundingClientRect().bottom - customSideBar.clientHeight) {
          to = article.getBoundingClientRect().bottom - customSideBar.clientHeight;
          customSideBar.style.top = to * progress + "px";
        }
        if (to <= topEdge) {
          to = topEdge;
          customSideBar.style.top = to * progress + "px";
        }
        customSideBar.style.top = to * progress + "px";
      },
    });
  } else {
    animate({
      duration: 2000,
      timing: makeEaseOut(quad),
      draw(progress) {
          let to = 0;
          customSideBar.style.top = to * progress + "px";
      },
    });
  }
}

// if (window.pageYOffset / screenHeight > 1) {
//   debugger
//   moveSideBar();
// }



function animate(options) {
  let start = performance.now();

  requestAnimationFrame(function animate(time) {

    let timeFraction = (time - start) / options.duration;
    if (timeFraction > 1) timeFraction = 1;

    let progress = options.timing(timeFraction);

    options.draw(progress);

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
}

