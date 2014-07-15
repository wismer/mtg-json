require 'sequel'
require 'sinatra'
DB = Sequel.connect('sqlite://ftm.db')
class SummaryApp < Sinatra::Base; end

class SummaryApp
  def link_to(job)
    "<a href='/occupations/#{job}'>#{job}</a>"
  end

  get '/' do
    erb :index
  end

  get '/occupations' do

  end

  get '/occupations/:occupation' do
    erb :occupation
  end
end


# account for occupations that are in the same field (e.g. Lawyer and Attorney at Law are in LEGAL)