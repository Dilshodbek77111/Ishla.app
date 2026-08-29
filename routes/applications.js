const router = require('express').Router();
const { auth, roles, premium } = require('../middleware/auth');
const { read, transact, id, now } = require('../db');
const { send } = require('../services/email');

router.post('/', auth, roles('seeker'), premium, async (req, res, next) => {
  try {
    const db = read();
    const listing = db.listings.find(
      x => x.id === req.body?.listingId && x.status === 'approved'
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found', error: 'NOT_FOUND' });
    }

    if (db.applications.some(a => a.listingId === listing.id && a.seekerId === req.user.id)) {
      return res.status(409).json({ success: false, message: 'Already applied', error: 'DUPLICATE_APPLICATION' });
    }

    const timestamp = now();
    const application = {
      id: id(),
      listingId: listing.id,
      seekerId: req.user.id,
      employerId: listing.employerId,
      coverLetter: String(req.body?.coverLetter || '').slice(0, 5000),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await transact(db => db.applications.push(application));

    const employer = read().users.find(u => u.id === listing.employerId);
    if (employer) {
      send(
        employer.email,
        'New application on Ishla',
        `${req.user.firstName} applied for ${listing.title}.`
      );
    }

    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    return next(error);
  }
});

router.get('/my', auth, roles('seeker'), (req, res) => {
  const applications = read().applications.filter(x => x.seekerId === req.user.id);
  return res.json({ success: true, data: applications });
});

router.get('/employer', auth, roles('employer'), (req, res) => {
  const applications = read().applications.filter(x => x.employerId === req.user.id);
  return res.json({ success: true, data: applications });
});

router.put('/:id/status', auth, roles('employer'), async (req, res, next) => {
  try {
    const application = read().applications.find(
      x => x.id === req.params.id && x.employerId === req.user.id
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found', error: 'NOT_FOUND' });
    }

    const allowedStatuses = ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'];
    if (!allowedStatuses.includes(req.body?.status)) {
      return res.status(422).json({ success: false, message: 'Invalid status', error: 'VALIDATION_ERROR' });
    }

    await transact(db => {
      const item = db.applications.find(v => v.id === application.id);
      item.status = req.body.status;
      item.updatedAt = now();
    });

    return res.json({
      success: true,
      data: read().applications.find(x => x.id === application.id)
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/saved', auth, async (req, res, next) => {
  try {
    const db = read();
    const listing = db.listings.find(
      x => x.id === req.body?.listingId && x.status === 'approved'
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found', error: 'NOT_FOUND' });
    }

    if (db.savedListings.some(x => x.userId === req.user.id && x.listingId === listing.id)) {
      return res.json({ success: true, data: { saved: true } });
    }

    const timestamp = now();
    const saved = {
      id: id(),
      userId: req.user.id,
      listingId: listing.id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await transact(db => db.savedListings.push(saved));
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return next(error);
  }
});

router.delete('/saved/:listingId', auth, async (req, res, next) => {
  try {
    await transact(db => {
      db.savedListings = db.savedListings.filter(
        x => !(x.userId === req.user.id && x.listingId === req.params.listingId)
      );
    });

    return res.json({ success: true, data: { saved: false } });
  } catch (error) {
    return next(error);
  }
});

router.get('/saved', auth, (req, res) => {
  const db = read();
  const listings = db.savedListings
    .filter(x => x.userId === req.user.id)
    .map(x => db.listings.find(l => l.id === x.listingId))
    .filter(Boolean);

  return res.json({ success: true, data: listings });
});

router.post('/offers', auth, roles('employer'), async (req, res, next) => {
  try {
    const seeker = read().users.find(
      x => x.id === req.body?.seekerId && x.role === 'seeker'
    );

    if (!seeker) {
      return res.status(404).json({ success: false, message: 'Seeker not found', error: 'NOT_FOUND' });
    }

    const timestamp = now();
    const offer = {
      id: id(),
      employerId: req.user.id,
      seekerId: seeker.id,
      listingId: req.body?.listingId || null,
      message: String(req.body?.message || '').slice(0, 5000),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await transact(db => db.offers.push(offer));
    send(seeker.email, 'New job offer on Ishla', offer.message);

    return res.status(201).json({ success: true, data: offer });
  } catch (error) {
    return next(error);
  }
});

router.put('/offers/:id', auth, roles('seeker'), async (req, res, next) => {
  try {
    const offer = read().offers.find(
      x => x.id === req.params.id && x.seekerId === req.user.id
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found', error: 'NOT_FOUND' });
    }

    if (!['accepted', 'rejected'].includes(req.body?.status)) {
      return res.status(422).json({ success: false, message: 'Invalid status', error: 'VALIDATION_ERROR' });
    }

    await transact(db => {
      const item = db.offers.find(v => v.id === offer.id);
      item.status = req.body.status;
      item.updatedAt = now();
    });

    return res.json({
      success: true,
      data: read().offers.find(x => x.id === offer.id)
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
