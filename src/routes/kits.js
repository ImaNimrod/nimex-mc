const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");

const Kit = require("../models/kit.js");

const router = express.Router();

router.get("/", (req, res, next) => {
    Kit.find({})
        .then((kits) => {
            if (kits.length > 0) {
                res.status(200).json({ kits });
            } else {
                res.status(204).json({});
            }
        })
        .catch((err) => {
            next(createError(err.message));
        });
});

router.get("/:id", (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next(createError("invalid kit id value"));
        return;
    }

    Kit.findById(req.params.id)
        .then((kit) => {
            if (kit !== null) {
                res.status(200).json(kit);
            } else {
                next(createError(404, "kit not found"));
            }
        })
        .catch((err) => {
            next(createError(err.message));
        });
});

router.put("/:id", (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next(createError("invalid kit id value"));
        return;
    }

    Kit.findById(req.params.id)
        .then(async (kit) => {
            if (kit !== null) {
                if (req.body.description != undefined) {
                    kit.description = req.body.description;
                }
                if (req.body.inStock != undefined) {
                    kit.inStock = req.body.inStock;
                }

                await kit.save();
                res.status(200).json(kit);
            } else {
                next(createError(404, "kit not found"));
            }
        })
        .catch((err) => {
            next(createError(err.message));
        });
});

module.exports = router;
