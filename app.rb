require 'sequel'
require 'sinatra'
require 'json'
DB = Sequel.connect('sqlite://ftm.db')
class SummaryApp < Sinatra::Base; end

class SummaryApp
  def link_to(job)
    "<a href='/occupations/#{job}' title='#{job}'>#{job}</a>"
  end

  get '/' do
    erb :index
  end

  get '/cards' do
    erb :cards
  end

  get '/occupations' do
    erb :occupation
  end

  get '/occupations/all' do
    list = { :jobs => DB[:occupations].order(:transaction_total).all.reverse }
    JSON.generate(list)
  end

  get '/occupations/:occupation' do
    job = DB[:occupations].where(title: params[:occupation]).first
    JSON.generate(job)
  end
end


# account for occupations that are in the same field (e.g. Lawyer and Attorney at Law are in LEGAL)