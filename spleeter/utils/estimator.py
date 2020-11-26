#!/usr/bin/env python
# coding: utf8

""" Utility functions for creating estimator. """

from pathlib import Path
from os.path import join

# pylint: disable=import-error
import tensorflow as tf


from ..model import model_fn
from ..model.provider import get_default_model_provider



def get_default_model_dir(model_dir):
    """
    Transforms a string like 'spleeter:2stems' into an actual path.
    :param model_dir:
    :return:
    """
    model_provider = get_default_model_provider()
    return model_provider.get(model_dir)
