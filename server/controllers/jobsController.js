import Job from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from '../errors/index.js';
import checkPermissions from '../utils/checkPermissions.js';
import mongoose from 'mongoose';
import moment from 'moment';

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new BadRequestError('Please provide all values');
  }

  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};
const getAllJobs = async (req, res) => {
  console.log(req.user);
  const { status, jobType, sort, search } = req.query;

  const queryOjbect = {
    createdBy: req.user.userId,
  };

  //add stuff based on condition

  if (status !== 'all') queryOjbect.status = status;

  if (jobType !== 'all') queryOjbect.jobType = jobType;

  if (search) queryOjbect.position = { $regex: search, $options: 'i' };

  //NO AWAIT
  let result = Job.find(queryOjbect);

  //chain sort conditions
  if (sort === 'latest') result = result.sort('-createdAt');
  if (sort === 'oldest') result = result.sort('-createdAt');
  if (sort === 'a-z') result = result.sort('position');
  if (sort === 'z-a') result = result.sort('-position');

  //setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // console.log(`page: ${page}, limit:${limit}, skip: ${skip}`);

  result = result.skip(skip).limit(limit);
  //75
  //10 10 10 10 10 10 10 5
  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryOjbect);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position } = req.body;

  if (!position || !company) {
    throw new BadRequestError('Please provide all values');
  }
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with id :${jobId}`);
  }
  //check permissions
  // console.log(typeof req.user.userId);
  // console.log(typeof job.createdBy);

  checkPermissions(req.user, job.createdBy);

  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ updatedJob });
};
const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id :${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  await job.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Job removed' });
};
const showStats = async (req, res) => {
  console.log(req.user.userId)
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
export { createJob, deleteJob, getAllJobs, updateJob, showStats };
