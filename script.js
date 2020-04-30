export { Roulette };

class Roulette {

    constructor(rouletteConfig) {
        this.isSpinning = false;

        this.container = this.makeContainer();
        this.makeRoulette(rouletteConfig, this.container);
        
        //button to do spins
        this.spinBtn = this.makeSpinButton();
        this.btnText = this.makeBtnText();
        this.spinBtn.appendChild(this.btnText);
        this.container.appendChild(this.spinBtn);
        
        //empty container for rotating the spinner easily
        this.spinnerHolster = this.makeSpinnerHolster();
        this.spinBtn.appendChild(this.spinnerHolster);
        
        //the spinner itself
        this.spinner = this.makeSpinner();
        this.spinnerHolster.appendChild(this.spinner);
    }

    getElement() {
        return this.container;
    }

    makeSpinner() {
        //the spinner itself
        var spinner = document.createElement("span");
        spinner.setAttribute("id", "roulette-spinner");
        return spinner;
    }

    makeSpinButton() {
        //button to do spins
        var btn = document.createElement("div");
        btn.setAttribute("id", "roulette-spinBtn");
        btn.onclick = this.onClickInternal.bind(this);
        return btn;
    }

    makeBtnText() {
        var btnText = document.createTextNode("SPIN");
        return btnText;
    }

    makeSpinnerHolster() {
        //container used to rotate the spinner
        var spinnerHolster = document.createElement("div");
        spinnerHolster.setAttribute("id", "roulette-spinHolster");
        return spinnerHolster;
    }

    makeContainer() {
        //top level element in the roulette
        var container = document.createElement("div");
        container.setAttribute("id", "roulette-container");
        return container;
    }

    makeRoulette(rouletteConfig, container) {
        this.rouletteConfig = rouletteConfig;
        this.rouletteTotalWeights = 0.0;
        for (var roulettePiece of rouletteConfig) {
            if (roulettePiece.weight) {
                this.rouletteTotalWeights += roulettePiece.weight;
            }
        }
        if (this.rouletteTotalWeights == 0.0) {
            throw new Error("Roulette must have total weights greater than zero.");
        }
        var pieceStart = 0.0;
        for (var roulettePiece of rouletteConfig) {
            roulettePiece.ratio = roulettePiece.weight / this.rouletteTotalWeights;
            roulettePiece.start = pieceStart;
            var pieceElem = this.makeRouletteSection(roulettePiece);
            roulettePiece.elem = pieceElem;
            container.appendChild(pieceElem);
            pieceStart += roulettePiece.ratio;
        }
    }

    makeRouletteSection(sectionConfig) {
        var elem = document.createElement("div");
        elem.classList.add("roulette-section");
        elem.style["background-color"] = sectionConfig.color;
        elem.style["clip-path"] = this.makeClipPath(sectionConfig);
        return elem;
    }

    makeClipPath(sectionConfig) {
        var arcStart = sectionConfig.start;
        var arcRatio = sectionConfig.ratio;

        var theta1 = Math.PI * 2.0 * arcStart;
        sectionConfig.theta1 = theta1;

        var theta2 = Math.PI * 2.0 * (arcStart + arcRatio);
        sectionConfig.theta2 = theta2;

        var sideStart = this.thetaToSide(theta1);
        var sideEnd = this.thetaToSide(theta2);

        var clipPath = "50% 50%";

        clipPath += ", " + this.circleToSquare(theta1);

        var curSide = sideStart;
        var curTheta = theta1;
        var thetaDelta = theta2 - theta1;

        while (curSide != sideEnd || thetaDelta > Math.PI * 0.25) {
            var nextPathPt = this.nextClipPathPt(curSide);
            var nextSide = nextPathPt.side;
            var nextPt = nextPathPt.pt;
            var nextTheta = nextPathPt.theta;
            if (nextPt != null) {
                clipPath += ", " + nextPt;
            }
            curSide = nextSide;
            curTheta = nextTheta;
            thetaDelta -= Math.PI * 0.25;
        }
        clipPath += ", " + this.circleToSquare(theta2);

        return "polygon(" + clipPath + ")";
    }

    nextClipPathPt(ptName) {
        switch (ptName) {
            case "top":
                return { side: "topLeft", pt: "0% 0%", theta: Math.PI * 0.75 };
            case "topLeft":
                return { side: "left", pt: null, theta: Math.PI * 1.0 };
            case "left":
                return { side: "bottomLeft", pt: "0% 100%", theta: Math.PI * 1.25 };
            case "bottomLeft":
                return { side: "bottom", pt: null, theta: Math.PI * 1.5 };
            case "bottom":
                return { side: "bottomRight", pt: "100% 100%", theta: Math.PI * 1.75 };
            case "bottomRight":
                return { side: "right", pt: null, theta: Math.PI * 2.0 };
            case "right":
                return { side: "topRight", pt: "100% 0%", theta: Math.PI * 0.25 };
            case "topRight":
                return { side: "top", pt: null, theta: Math.PI * 0.5 };
        }
    }

    circleToSquare(theta) {
        var squareX = 1.0;
        var squareY = 1.0;

        var side = this.thetaToSide(theta);
        switch (side) {
            case "top":
                squareY = 1.0;
                squareX = Math.tan(Math.PI * 0.5 - theta);
                break;
            case "left":
                squareX = -1.0;
                squareY = Math.tan(Math.PI - theta);
                break;
            case "bottom":
                squareY = -1.0;
                squareX = Math.tan(Math.PI * 1.5 - theta);
                break;
            case "right":
                squareX = 1.0;
                squareY = (theta <= Math.PI * 0.25) ? Math.tan(theta) : Math.tan(theta - Math.PI * 2.0);
                break;
        }

        var xPercent = ((squareX + 1.0) / 2.0) * 100.0 + "%";
        var yPercent = (1.0 - ((squareY + 1.0) / 2.0)) * 100.0 + "%";
        return xPercent + " " + yPercent;
    }

    thetaToSide(theta) {
        //0 - top side 
        if (theta > Math.PI * 0.25 && theta < Math.PI * 0.75) {
            return "top";
        }
        //1 - left side
        else if (theta >= Math.PI * 0.75 && theta < Math.PI * 1.25) {
            return "left";
        }
        //2 - bottom side
        else if (theta >= Math.PI * 1.25 && theta < Math.PI * 1.75) {
            return "bottom";
        }
        //3 - right side
        else {
            return "right";
        }
    }

    thetaToSection(theta) {

        var thetaMod = theta % (Math.PI * 2.0);

        for (var roulettePiece of this.rouletteConfig) {
            if(thetaMod >= roulettePiece.theta1 && thetaMod <= roulettePiece.theta2) {
                return roulettePiece;
            }
        }
        return null;
    }

    highlightSection(doHighlight, element) {
        if(doHighlight) {
            element.classList.add("roulette-highlightPiece");
        }
        else {
            element.classList.remove("roulette-highlightPiece");
        }
    }

    onClickInternal(e) {
        this.onClick();
    }

    spinToRandomSection() {
        var idx = Math.round(Math.random() * (this.rouletteConfig.length - 1));
        var randomSection = this.rouletteConfig[idx];
        this.spinTo(randomSection.name);
    }

    spinTo(sectionName) {
        for (var roulettePiece of this.rouletteConfig) {
            if(roulettePiece.name === sectionName) {
                var randomThetaInSection = roulettePiece.theta1 + ((roulettePiece.theta2 - roulettePiece.theta1) * Math.random());
                this.startSpinning(0.0, randomThetaInSection);
                return;
            }
        }
    }

    startSpinning(startTheta, targetTheta) {

        if(!this.isSpinning) {
            this.isSpinning = true;
        }
        //already spinning
        else {
            return;
        }

        this.spinBtn.classList.add("roulette-spinning");

        var nExtraSpins = 8 + Math.round(Math.random() * 5.0);
        var endTheta = (Math.PI * 2.0 * nExtraSpins) + targetTheta;
        
        const maxSpeed = 0.1;
        const minSpeed = 0.00001;
        var speed = maxSpeed;

        var lastFrameTime = Date.now();
        var curTheta = startTheta;
        var pieceWereOn = this.thetaToSection(startTheta);
        this.highlightSection(true, pieceWereOn.elem);

        var spin = function() {
            var timeStamp = Date.now();
            var deltaTimeMs = timeStamp - lastFrameTime;
            lastFrameTime = timeStamp;
            curTheta += speed * deltaTimeMs;

            var piece = this.thetaToSection(curTheta);
            if(piece.theta1 != pieceWereOn.theta1 && piece.theta2 != pieceWereOn.theta2) {
                this.highlightSection(false, pieceWereOn.elem);
                this.highlightSection(true, piece.elem);
                this.onSectionPassed(pieceWereOn.name, piece.name);
                pieceWereOn = piece;
            }

            var ratioComplete = 1.0 - (curTheta - startTheta) / (endTheta - startTheta);

            //make speed slower as we get closer to the goal
            speed = minSpeed + (ratioComplete * (maxSpeed - minSpeed));

            //cap it from going past the end theta
            curTheta = Math.min(endTheta, curTheta);
            //update the element
            this.spinnerHolster.style["transform"] = "rotate(" + -curTheta + "rad)";

            if(curTheta < endTheta) {
                window.requestAnimationFrame(spin.bind(this));
            }
            //finished 
            else {
                this.spinBtn.classList.remove("roulette-spinning");
                this.isSpinning = false;
                this.highlightSection(false, pieceWereOn.elem);
                this.onFinishedSpinning(pieceWereOn.name);
            }


        }.bind(this);

        window.requestAnimationFrame(spin.bind(this));
    }

    //this is for public use to have something outside happen when the spin button is clicked
    onClick() {

    }

    //public method for when a section is passed by the spinner (i.e. could play a sound)
    onSectionPassed(oldSectionName, newSectionName) {

    }

    //public method for when the spinner finishes
    onFinishedSpinning(sectionName) {

    }

}