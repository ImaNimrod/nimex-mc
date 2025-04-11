function getBlockCenter(entity) {
    const effective = getEffectivePosition(entity);
    const dim = (entity.metadata && entity.metadata[12]) || { x: 1, y: 1, z: 1 };

    return {
        x: effective.x + dim.x / 2,
        y: effective.y + dim.y / 2,
        z: effective.z + dim.z / 2,
    };
}

function getEffectivePosition(entity) {
    const pos = entity.position;
    const offset = (entity.metadata && entity.metadata[11]) || { x: 0, y: 0, z: 0 };

    return {
        x: pos.x + offset.x,
        y: pos.y + offset.y,
        z: pos.z + offset.z,
    };
}

function gridKey(point) {
    return `${point.x.toFixed(1)},${point.z.toFixed(1)}`;
}

function buildGrid(bot) {
    const grid = {};

    for (const entityId in bot.entities) {
        const entity = bot.entities[entityId];
        if (entity.name === "block_display") {
            const blockId = (entity.metadata && entity.metadata[23]) || null;
            if (blockId === 2060) {
                const center = getBlockCenter(entity);
                const key = gridKey(center);
                grid[key] = center;
            }
        }
    }
    return grid;
}

function findPathBFS(startKey, goalKey, grid) {
    const queue = [];
    const cameFrom = {};

    queue.push(startKey);
    cameFrom[startKey] = null;

    const directions = [
        { dx: 1, dz: 0 },
        { dx: -1, dz: 0 },
        { dx: 0, dz: 1 },
        { dx: 0, dz: -1 },
    ];

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === goalKey) {
            break;
        }

        const [cxStr, czStr] = current.split(",");
        const cx = parseFloat(cxStr), cz = parseFloat(czStr);
        for (const d of directions) {
            const nx = cx + d.dx;
            const nz = cz + d.dz;
            const neighborKey = `${nx.toFixed(1)},${nz.toFixed(1)}`;
            if (grid[neighborKey] !== undefined && cameFrom[neighborKey] === undefined) {
                queue.push(neighborKey);
                cameFrom[neighborKey] = current;
            }
        }
    }

    if (cameFrom[goalKey] === undefined) {
        return null;
    }

    const path = [];

    let current = goalKey;
    while (current !== null) {
        path.push(current);
        current = cameFrom[current];
    }

    path.reverse();
    return path;
}

async function followBFSPath(pathKeys, grid, bot) {
    bot.setControlState("sneak", true);
    const tol = 0.2;

    for (let i = 0; i < pathKeys.length; i++) {
        const target = grid[pathKeys[i]];

        while (Math.abs(bot.entity.position.x - target.x) > tol) {
            bot.setControlState("left", false);
            bot.setControlState("right", false);

            const deltaX = target.x - bot.entity.position.x;
            if (deltaX > tol) {
                bot.setControlState("left", true);
            } else if (deltaX < -tol) {
                bot.setControlState("right", true);
            }

            await bot.waitForTicks(2);
        }

        bot.setControlState("left", false);
        bot.setControlState("right", false);

        while (Math.abs(bot.entity.position.z - target.z) > tol) {
            bot.setControlState("forward", false);
            bot.setControlState("back", false);

            const deltaZ = target.z - bot.entity.position.z;
            if (deltaZ > tol) {
                bot.setControlState("forward", true);
            } else if (deltaZ < -tol) {
                bot.setControlState("back", true);
            }

            await bot.waitForTicks(2);
        }

        bot.setControlState("forward", false);
        bot.setControlState("back", false);

        await bot.waitForTicks(2);
    }

    const finalTarget = { x: -999.5, z: -1004.5 };

    while (Math.abs(bot.entity.position.x - finalTarget.x) > tol) {
        bot.setControlState("left", false);
        bot.setControlState("right", false);

        const deltaX = finalTarget.x - bot.entity.position.x;
        if (deltaX > tol) {
            bot.setControlState("left", true);
        } else if (deltaX < -tol) {
            bot.setControlState("right", true);
        }

        await bot.waitForTicks(2);
    }

    bot.setControlState("left", false);
    bot.setControlState("right", false);

    while (Math.abs(bot.entity.position.z - finalTarget.z) > tol) {
        bot.setControlState("forward", false);
        bot.setControlState("back", false);

        const deltaZ = finalTarget.z - bot.entity.position.z;
        if (deltaZ > tol) {
            bot.setControlState("forward", true);
        } else if (deltaZ < -tol) {
            bot.setControlState("back", true);
        }

        await bot.waitForTicks(2);
    }

    bot.setControlState("forward", false);
    bot.setControlState("back", false);
}

module.exports = async function solveMaze(bot) {
    const grid = buildGrid(bot);

    const startPoint = { x: -999.5, y: 0, z: -1019.5 };
    const goalPoint  = { x: -999.5, y: 0, z: -1005.5 };

    const pathKeys = findPathBFS(gridKey(startPoint), gridKey(goalPoint), grid);
    if (pathKeys === null) {
        throw Error("unable to find path to goal point");
    }

    await followBFSPath(pathKeys, grid, bot);
};
